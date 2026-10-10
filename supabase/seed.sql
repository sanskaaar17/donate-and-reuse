-- ============================================================================
-- DONATE & REUSE — DEVELOPMENT SEED DATA (PHASE 2)
-- Run this AFTER creating at least one user via registration or auth.users
-- ============================================================================

-- Optional: This function seeds 10 realistic college items using an existing profile
-- Replace '00000000-0000-0000-0000-000000000000' with your actual registered user ID from profiles.
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    SELECT id INTO first_user_id FROM public.profiles LIMIT 1;

    IF first_user_id IS NOT NULL THEN
        -- Insert realistic starter donations
        INSERT INTO public.donations (donor_id, title, category, subcategory, condition, location, status, image_url, pickup_times, description, tags)
        VALUES
        (
            first_user_id,
            'Casio fx-991EX ClassWiz Scientific Calculator',
            'College Essentials',
            'Scientific Calculators & Drawing Instruments',
            'Like New',
            'Campus Central Library, 2nd Floor',
            'Available',
            'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
            'Mon - Fri, 2:00 PM to 6:00 PM',
            'Mint condition scientific calculator with dual power (solar + battery) and protective slip-on hard case. Finished my engineering math course and want to hand it to a junior.',
            ARRAY['Calculator', 'Engineering Math', 'Exam Ready']
        ),
        (
            first_user_id,
            'Higher Engineering Mathematics (B.S. Grewal, 44th Edition)',
            'College Essentials',
            'Textbooks & Reference Books',
            'Gently Used',
            'Engineering Block A, Near Dean Office',
            'Available',
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
            'Weekdays after 4:00 PM',
            'Standard engineering mathematics reference book. Clean pages with minimal highlights in differential equations. Binding is firm and intact.',
            ARRAY['Math', 'Textbook', 'Semester 1-3']
        ),
        (
            first_user_id,
            '100% Cotton White Chemistry / Biology Lab Coat (Size M)',
            'College Essentials',
            'Lab Coats & Lab Supplies',
            'Like New',
            'Science Complex, Chemistry Lab foyer',
            'Available',
            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
            'Flexible, can meet near Main Canteen',
            'Full-sleeve sterile white apron/lab coat with chest pocket and deep side pockets. Cleaned, washed, and pressed. Perfect for first-year practicals.',
            ARRAY['Lab Coat', 'Chemistry', 'Safety Gear']
        ),
        (
            first_user_id,
            'Arduino Uno R3 Starter Kit + Breadboard & Jumper Wires',
            'College Essentials',
            'Engineering Project Materials',
            'Like New',
            'Robotics & IoT Innovation Hub',
            'Available',
            'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80',
            'Mon & Wed, 3:00 PM - 5:00 PM',
            'Original Arduino Uno microcontroller, 830-tie point solderless breadboard, 65 male-to-male jumpers, 10 LEDs, and assorted resistors for IoT projects.',
            ARRAY['IoT', 'Arduino', 'Hardware Project']
        ),
        (
            first_user_id,
            'Mini Drafter with Clamps & Sheet Container (ED / Civil)',
            'College Essentials',
            'Scientific Calculators & Drawing Instruments',
            'Gently Used',
            'Civil Drafting Hall, Ground Floor',
            'Available',
            'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
            'Daily 1:00 PM to 2:30 PM',
            'Rotatable mini-drafter for engineering graphics with sturdy steel clamp and dual scale ruler. Comes with a black cylindrical sheet holder.',
            ARRAY['Engineering Drawing', 'Drafter', 'Civil']
        ),
        (
            first_user_id,
            'Handwritten Comprehensive Data Structures & Algorithms Notes',
            'College Essentials',
            'Notes & Previous-Year Papers',
            'Like New',
            'Computer Center, 3rd Floor',
            'Available',
            'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
            'Tuesday & Thursday 11:00 AM',
            'Spiral-bound handwritten lecture notes covering trees, graphs, dynamic programming, sorting, and 5 years of solved university exam papers.',
            ARRAY['DSA', 'Computer Science', 'Exam Notes']
        ),
        (
            first_user_id,
            'Unopened A4 Graph Sheets & Ruled Practical Records (Pack of 3)',
            'College Essentials',
            'Stationery & Record Books',
            'Brand New',
            'Hostel 4 Common Lounge',
            'Available',
            'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80',
            'Any evening after 6:00 PM',
            'Brand new unused hardcover practical record books (80 pages each) plus a full pad of mm-division grid graph papers.',
            ARRAY['Practical Records', 'Stationery', 'Graph Paper']
        ),
        (
            first_user_id,
            'Water-Resistant College Laptop Backpack (15.6 inch)',
            'College Essentials',
            'Bags & College Accessories',
            'Gently Used',
            'Student Activity Center (SAC)',
            'Available',
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
            'Saturday morning or by appointment',
            'Sturdy black dual-compartment backpack with padded sleeve for up to 15.6” laptop, water bottle mesh, and reinforced shoulder straps.',
            ARRAY['Backpack', 'Laptop Bag', 'Campus Gear']
        );
        RAISE NOTICE 'Sample donations seeded successfully for user %', first_user_id;
    ELSE
        RAISE NOTICE 'No profile found yet. Register a user in the web application first, then run this seed script.';
    END IF;
END $$;
