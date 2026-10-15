import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CATEGORIES, COLLEGE_SUBCATEGORIES, CONDITIONS, DEFAULT_FALLBACK_IMAGE } from '../data/demoData';
import { useAuth } from './AuthContext';

const ItemsContext = createContext(null);

function requireSupabase(configured) {
  if (!configured) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in .env, then restart Vite.');
  }
}

function throwRpcError(data, error) {
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'The requested operation could not be completed.');
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Recently';
  const date = new Date(timestamp);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 5) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function presentDonation(row) {
  const donor = row.donor || row.profiles || {};
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    subcategory: row.subcategory,
    condition: row.condition,
    location: row.location,
    status: row.status,
    donorId: row.donor_id,
    donorName: donor.full_name || 'Campus Contributor',
    donorRole: donor.campus_role || 'Engineering Student',
    donorDepartment: donor.department || 'Engineering',
    postedDate: formatTimeAgo(row.created_at),
    description: row.description,
    imageUrl: row.image_url || DEFAULT_FALLBACK_IMAGE,
    tags: row.tags || [row.category],
    pickupTimes: row.pickup_times || 'Flexible on campus',
    createdAt: row.created_at
  };
}

export function ItemsProvider({ children }) {
  const { user } = useAuth();
  const configured = isSupabaseConfigured();
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);
  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    setItemsError(null);
    if (!configured) {
      setItems([]);
      setItemsError('Configure Supabase to browse live donations.');
      setLoadingItems(false);
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          donor:profiles!donations_donor_id_fkey(id, full_name, campus_role, department)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const nextItems = (data || []).map(presentDonation);
      setItems(nextItems);
      return nextItems;
    } catch (error) {
      setItems([]);
      setItemsError(error.message || 'Unable to load donations.');
      throw error;
    } finally {
      setLoadingItems(false);
    }
  }, [configured]);

  useEffect(() => {
    fetchItems().catch((error) => console.error('Loading donations failed:', error));
  }, [fetchItems]);

  const uploadItemImage = async (file) => {
    requireSupabase(configured);
    if (!user) throw new Error('Sign in before uploading an item photo.');
    if (!file) return null;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Choose a JPG, PNG, or WebP image.');
    }
    if (file.size > 5 * 1024 * 1024) throw new Error('Image must be 5MB or smaller.');

    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    // crypto.randomUUID() is not available on some older Android WebViews (< Chrome 92)
    const uuid = typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    const path = `${user.id}/${uuid}.${extension}`;

    const { error } = await supabase.storage.from('donation-images').upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false
    });
    if (error) throw error;
    const { data } = supabase.storage.from('donation-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const createDonation = async (formData, imageFile = null) => {
    requireSupabase(configured);
    if (!user) throw new Error('You must be logged in to donate an item.');
    const title = formData.title?.trim() || '';
    const description = formData.description?.trim() || '';
    const category = formData.category;
    const subcategory = category === 'College Essentials' ? formData.subcategory : 'General';
    if (title.length < 3 || title.length > 120) throw new Error('Title must be between 3 and 120 characters.');
    if (description.length < 10 || description.length > 3000) throw new Error('Description must be between 10 and 3000 characters.');
    if (!CATEGORIES.includes(category)) throw new Error('Choose a valid donation category.');
    if (category === 'College Essentials' && !COLLEGE_SUBCATEGORIES.includes(subcategory)) {
      throw new Error('Choose a valid College Essentials subcategory.');
    }
    if (!CONDITIONS.includes(formData.condition)) throw new Error('Choose a valid item condition.');
    if ((formData.location?.trim() || '').length < 2) throw new Error('Pickup location must be at least 2 characters.');

    const imageUrl = imageFile ? await uploadItemImage(imageFile) : formData.imageUrl?.trim() || null;
    const tags = typeof formData.tags === 'string'
      ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 20)
      : [];
    const { data, error } = await supabase
      .from('donations')
      .insert({
        donor_id: user.id,
        title,
        description,
        category,
        subcategory,
        condition: formData.condition,
        location: formData.location.trim(),
        status: 'Available',
        image_url: imageUrl,
        pickup_times: formData.pickupTimes?.trim() || 'Flexible on campus',
        tags: tags.length ? tags : [category]
      })
      .select('*, donor:profiles!donations_donor_id_fkey(id, full_name, campus_role, department)')
      .single();
    if (error) throw error;
    await fetchItems();
    showToast(`"${title}" published to the campus catalog.`, 'success');
    return presentDonation(data);
  };

  const requestItem = async (donationId, message = '') => {
    requireSupabase(configured);
    if (!user) throw new Error('Please log in to request this item.');
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
      if (error.code === '23505') throw new Error('You already have an active request for this item.');
      if (error.message.includes('own donation')) throw new Error('You cannot request your own donation.');
      if (error.message.includes('not available')) throw new Error('This item is no longer available.');
      throw error;
    }
    showToast('Request sent to the donor. Check My Requests for updates.', 'success');
    return data;
  };

  const fetchMyDonations = async () => {
    requireSupabase(configured);
    if (!user) throw new Error('Sign in to view your donations.');
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        item_requests (
          id, status, message, created_at,
          requester:profiles!item_requests_requester_id_fkey(id, full_name, campus_role, department)
        )
      `)
      .eq('donor_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const donations = data || [];
    const acceptedIds = donations.flatMap((donation) =>
      (donation.item_requests || []).filter((request) => request.status === 'Accepted').map((request) => request.id)
    );
    const contacts = await Promise.all(acceptedIds.map(async (requestId) => {
      const { data: contact, error: contactError } = await supabase.rpc('get_accepted_request_contact', {
        p_request_id: requestId
      });
      if (contactError) throw contactError;
      return [requestId, contact];
    }));
    const contactByRequest = new Map(contacts);
    return donations.map((donation) => ({
      ...donation,
      item_requests: (donation.item_requests || []).map((request) => ({
        ...request,
        profiles: {
          ...request.requester,
          ...(contactByRequest.get(request.id)?.requester || {})
        }
      }))
    }));
  };

  const fetchMyRequests = async () => {
    requireSupabase(configured);
    if (!user) throw new Error('Sign in to view your requests.');
    const { data, error } = await supabase
      .from('item_requests')
      .select(`
        *,
        donation:donations!item_requests_donation_id_fkey (
          id, donor_id, title, category, subcategory, condition, location, status, image_url, pickup_times,
          donor:profiles!donations_donor_id_fkey(id, full_name, campus_role, department)
        )
      `)
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return Promise.all((data || []).map(async (request) => {
      if (request.status !== 'Accepted') return { ...request, donations: request.donation };
      const { data: contact, error: contactError } = await supabase.rpc('get_accepted_request_contact', {
        p_request_id: request.id
      });
      if (contactError) throw contactError;
      return {
        ...request,
        donations: {
          ...request.donation,
          profiles: {
            ...request.donation?.donor,
            ...(contact?.donor || {})
          }
        }
      };
    }));
  };

  const runRequestAction = async (functionName, args, successMessage, type = 'success') => {
    requireSupabase(configured);
    if (!user) throw new Error('Your session has expired. Please sign in again.');
    const { data, error } = await supabase.rpc(functionName, args);
    throwRpcError(data, error);
    await fetchItems();
    showToast(successMessage, type);
    return data;
  };

  const acceptRequest = (requestId) => runRequestAction(
    'accept_item_request',
    { p_request_id: requestId },
    'Request accepted. The item is now reserved.'
  );
  const declineRequest = (requestId) => runRequestAction(
    'decline_item_request',
    { p_request_id: requestId },
    'Request declined.',
    'info'
  );
  const cancelMyRequest = (requestId) => runRequestAction(
    'cancel_my_item_request',
    { p_request_id: requestId },
    'Your request has been cancelled.',
    'info'
  );
  const markDonationCompleted = (donationId) => runRequestAction(
    'mark_donation_completed',
    { p_donation_id: donationId },
    'Donation marked completed. Thank you for sharing.'
  );

  const deleteDonation = async (donationId) => {
    requireSupabase(configured);
    if (!user) throw new Error('Your session has expired. Please sign in again.');
    const { data, error } = await supabase
      .from('donations')
      .delete()
      .eq('id', donationId)
      .eq('donor_id', user.id)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Donation not found or you are not allowed to delete it.');
    await fetchItems();
    showToast('Donation listing deleted.', 'info');
  };

  const value = {
    items,
    loadingItems,
    itemsError,
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
    isConfigured: configured
  };

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
}

export function useItems() {
  const context = useContext(ItemsContext);
  if (!context) throw new Error('useItems must be used within an ItemsProvider');
  return context;
}
