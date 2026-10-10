// src/context/ItemsContext.jsx
// Manages Database-backed Donations, Item Requests, Storage Uploads, and Fallback Demo Data
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_DEMO_ITEMS, DEFAULT_FALLBACK_IMAGE } from '../data/demoData';
import { useAuth } from './AuthContext';

const ItemsContext = createContext(null);

export function ItemsProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(INITIAL_DEMO_ITEMS);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast] = useState(null);
  const isConfigured = isSupabaseConfigured();

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  // --------------------------------------------------------------------------
  // 1. FETCH DONATIONS FROM SUPABASE (OR FALLBACK TO DEMO DATA)
  // --------------------------------------------------------------------------
  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    if (!isConfigured) {
      // Use local demo data
      setItems(INITIAL_DEMO_ITEMS);
      setLoadingItems(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          profiles:donor_id (
            id,
            full_name,
            campus_role,
            department,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase donations query notice:', error.message);
        // Fallback to demo items if database table is not created yet
        setItems(INITIAL_DEMO_ITEMS);
      } else if (data && data.length > 0) {
        // Map database columns to app property names
        const formatted = data.map((d) => ({
          id: d.id,
          title: d.title,
          category: d.category,
          subcategory: d.subcategory,
          condition: d.condition,
          location: d.location,
          status: d.status,
          donorId: d.donor_id,
          donorName: d.profiles?.full_name || 'Campus Contributor',
          donorRole: d.profiles?.campus_role || 'Engineering Student',
          donorDepartment: d.profiles?.department || 'Engineering',
          donorEmail: d.profiles?.email,
          donorPhone: d.profiles?.phone,
          postedDate: formatTimeAgo(d.created_at),
          description: d.description,
          imageUrl: d.image_url || DEFAULT_FALLBACK_IMAGE,
          tags: d.tags || [d.category],
          pickupTimes: d.pickup_times || 'Flexible on campus',
          createdAt: d.created_at
        }));
        setItems(formatted);
      } else {
        // Table exists but is empty
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
      setItems(INITIAL_DEMO_ITEMS);
    } finally {
      setLoadingItems(false);
    }
  }, [isConfigured]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // --------------------------------------------------------------------------
  // 2. IMAGE UPLOAD HELPER (SUPABASE STORAGE)
  // --------------------------------------------------------------------------
  const uploadItemImage = async (file) => {
    if (!isConfigured || !user || !file) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('donation-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.warn('Storage upload error:', error.message);
        return null;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('donation-images')
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl || null;
    } catch (err) {
      console.error('Image upload failed:', err);
      return null;
    }
  };

  // --------------------------------------------------------------------------
  // 3. CREATE DONATION
  // --------------------------------------------------------------------------
  const createDonation = async (formData, imageFile = null) => {
    if (!user && isConfigured) {
      throw new Error('You must be logged in to donate an item.');
    }

    let finalImageUrl = formData.imageUrl?.trim() || DEFAULT_FALLBACK_IMAGE;

    // Handle optional file upload to Supabase Storage
    if (imageFile && isConfigured) {
      const uploadedUrl = await uploadItemImage(imageFile);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      }
    }

    if (isConfigured && user) {
      const newDonationRow = {
        donor_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        subcategory: formData.category === 'College Essentials' ? formData.subcategory : 'General',
        condition: formData.condition,
        location: formData.location.trim(),
        status: 'Available',
        image_url: finalImageUrl,
        pickup_times: formData.pickupTimes?.trim() || 'Flexible on campus',
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [formData.category]
      };

      const { data, error } = await supabase
        .from('donations')
        .insert(newDonationRow)
        .select(`
          *,
          profiles:donor_id (
            id,
            full_name,
            campus_role,
            department
          )
        `)
        .single();

      if (error) throw error;

      await fetchItems();
      showToast(`"${formData.title}" published successfully to campus catalog!`, 'success');
      return data;
    } else {
      // In-memory demo fallback if Supabase is unconfigured
      const demoItem = {
        id: `demo-${Date.now()}`,
        title: formData.title,
        category: formData.category,
        subcategory: formData.category === 'College Essentials' ? formData.subcategory : 'General',
        condition: formData.condition,
        location: formData.location,
        status: 'Available',
        donorName: formData.donorName || 'Student Contributor',
        donorRole: formData.donorRole || 'Campus Member',
        postedDate: 'Just now',
        description: formData.description,
        imageUrl: finalImageUrl,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [formData.category],
        pickupTimes: formData.pickupTimes || 'Flexible on campus'
      };
      setItems((prev) => [demoItem, ...prev]);
      showToast(`"${demoItem.title}" saved to local session state!`, 'success');
      return demoItem;
    }
  };

  // --------------------------------------------------------------------------
  // 4. REQUEST AN ITEM (With self-request & duplicate prevention)
  // --------------------------------------------------------------------------
  const requestItem = async (donationId, message = '') => {
    if (!isConfigured) {
      // Toggle demo reserved in fallback mode
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === donationId) {
            const nextStatus = item.status === 'Available' ? 'Reserved' : 'Available';
            return { ...item, status: nextStatus };
          }
          return item;
        })
      );
      showToast('Demo request simulated! Item status updated.', 'info');
      return { success: true };
    }

    if (!user) {
      throw new Error('Please log in with your college account to request items.');
    }

    // Find the item to check donor identity
    const targetItem = items.find((i) => i.id === donationId);
    if (targetItem && targetItem.donorId === user.id) {
      throw new Error('Self-request prohibited: You cannot request your own donation.');
    }

    if (targetItem && targetItem.status !== 'Available') {
      throw new Error('This item is currently not available for requests.');
    }

    // Check if user already has an active pending or accepted request
    const { data: existingRequests, error: checkError } = await supabase
      .from('item_requests')
      .select('id, status')
      .eq('donation_id', donationId)
      .eq('requester_id', user.id)
      .in('status', ['Pending', 'Accepted']);

    if (checkError) {
      console.warn('Check request notice:', checkError.message);
    }

    if (existingRequests && existingRequests.length > 0) {
      throw new Error('You already have an active request for this item.');
    }

    // Insert new request
    const { data, error } = await supabase
      .from('item_requests')
      .insert({
        donation_id: donationId,
        requester_id: user.id,
        status: 'Pending',
        message: message.trim() || 'I would like to request this item for my coursework.'
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('Self-request prohibited')) {
        throw new Error('You cannot request your own donation.');
      }
      if (error.message.includes('unique_active_request')) {
        throw new Error('You already have an active request for this item.');
      }
      throw error;
    }

    showToast('Request sent to the donor! Check "My Requests" for updates.', 'success');
    return data;
  };

  // --------------------------------------------------------------------------
  // 5. FETCH USER'S DONATIONS & INCOMING REQUESTS
  // --------------------------------------------------------------------------
  const fetchMyDonations = async () => {
    if (!isConfigured || !user) return [];

    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        item_requests (
          id,
          status,
          message,
          created_at,
          profiles:requester_id (
            id,
            full_name,
            campus_role,
            department,
            email,
            phone
          )
        )
      `)
      .eq('donor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  // --------------------------------------------------------------------------
  // 6. FETCH USER'S REQUESTS
  // --------------------------------------------------------------------------
  const fetchMyRequests = async () => {
    if (!isConfigured || !user) return [];

    const { data, error } = await supabase
      .from('item_requests')
      .select(`
        *,
        donations:donation_id (
          id,
          title,
          category,
          subcategory,
          condition,
          location,
          status,
          image_url,
          pickup_times,
          profiles:donor_id (
            id,
            full_name,
            campus_role,
            department,
            email,
            phone
          )
        )
      `)
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  // --------------------------------------------------------------------------
  // 7. ACCEPT REQUEST (Calls Atomic Postgres RPC)
  // --------------------------------------------------------------------------
  const acceptRequest = async (requestId) => {
    if (!isConfigured || !user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('accept_item_request', {
      p_request_id: requestId
    });

    if (error) throw error;

    if (data && !data.success) {
      throw new Error(data.error || 'Failed to accept request');
    }

    await fetchItems();
    showToast('Request accepted! The item is now marked as Reserved.', 'success');
    return data;
  };

  // --------------------------------------------------------------------------
  // 8. DECLINE REQUEST
  // --------------------------------------------------------------------------
  const declineRequest = async (requestId) => {
    if (!isConfigured || !user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('decline_item_request', {
      p_request_id: requestId
    });

    if (error) throw error;
    showToast('Request declined.', 'info');
    return data;
  };

  // --------------------------------------------------------------------------
  // 9. CANCEL MY REQUEST
  // --------------------------------------------------------------------------
  const cancelMyRequest = async (requestId) => {
    if (!isConfigured || !user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('cancel_my_item_request', {
      p_request_id: requestId
    });

    if (error) throw error;
    await fetchItems();
    showToast('Your request has been cancelled.', 'info');
    return data;
  };

  // --------------------------------------------------------------------------
  // 10. MARK DONATION COMPLETED (Handover Done)
  // --------------------------------------------------------------------------
  const markDonationCompleted = async (donationId) => {
    if (!isConfigured || !user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('mark_donation_completed', {
      p_donation_id: donationId
    });

    if (error) throw error;
    await fetchItems();
    showToast('Donation marked as Completed! Thank you for sharing.', 'success');
    return data;
  };

  // --------------------------------------------------------------------------
  // 11. DELETE DONATION
  // --------------------------------------------------------------------------
  const deleteDonation = async (donationId) => {
    if (!isConfigured || !user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', donationId)
      .eq('donor_id', user.id);

    if (error) throw error;
    await fetchItems();
    showToast('Donation listing deleted.', 'info');
  };

  // Helper time formatter
  function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  const value = {
    items,
    loadingItems,
    fetchItems,
    createDonation,
    requestItem,
    fetchMyDonations,
    fetchMyRequests,
    acceptRequest,
    declineRequest,
    cancelMyRequest,
    markDonationCompleted,
    deleteDonation,
    selectedItem,
    setSelectedItem,
    closeItemModal: () => setSelectedItem(null),
    toast,
    showToast,
    hideToast,
    isConfigured
  };

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
}

export function useItems() {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
}
