-- NGOConnect — demo data. ALL entries are fictional (is_sample = true).
-- Contact details are obviously fake. Delete them before launch with the
-- admin "Delete all sample listings" button, or:
--   delete from public.ngos where is_sample;
-- Images live in /public/samples (local placeholder SVGs).

delete from public.ngos where is_sample;

insert into public.ngos (
  slug, name, tagline, description, activities, causes, help_types, help_notes,
  area, address, maps_url, lat, lng, phone, whatsapp, email, website,
  instagram, facebook, linkedin, youtube, donation_link,
  founded_year, registration_type, registration_number, visiting_hours, languages,
  logo_url, cover_url, gallery_urls, is_featured, status, is_sample
) values
(
  'sample-learning-foundation',
  'Sample Learning Foundation',
  'Free evening classes for school kids in Kothrud.',
  E'This is a sample listing used to demo NGOConnect.\n\nThe Sample Learning Foundation runs free evening study classes for children from nearby bastis. Volunteers help with homework, reading and basic maths in Marathi and English.',
  array['Evening study classes (Class 1–8)', 'Weekend reading club', 'School supply drives every June'],
  array['education', 'child-welfare'],
  array['volunteer', 'donate-items', 'donate-money'],
  'Looking for weekend volunteers to teach English and maths (2 hours a week).',
  'kothrud', 'Sample Lane, Kothrud, Pune, Maharashtra 411038', 'https://maps.google.com/?q=Kothrud,Pune',
  18.5074, 73.8077,
  '+91 00000 00000', '+910000000000', 'hello@example.org', 'https://example.org',
  'https://instagram.com/example', 'https://facebook.com/example', null, null, 'https://example.org/donate',
  2015, 'Trust', 'SAMPLE-0001', 'Mon–Sat, 5 pm – 8 pm', array['Marathi', 'Hindi', 'English'],
  '/samples/learning-logo.svg', '/samples/learning-cover.svg',
  array['/samples/learning-cover.svg', '/samples/udaan-cover.svg', '/samples/green-cover.svg'],
  true, 'published', true
),
(
  'sample-paws-rescue-trust',
  'Sample Paws Rescue Trust',
  'Rescue, treatment and adoption for street animals.',
  E'This is a sample listing used to demo NGOConnect.\n\nSample Paws Rescue Trust picks up injured street dogs and cats, treats them at a small shelter and finds them loving homes.',
  array['24×7 rescue for injured animals', 'Vaccination and sterilisation drives', 'Weekend adoption camps'],
  array['animal-welfare'],
  array['volunteer', 'donate-money', 'donate-items', 'events-drives'],
  'We always need old blankets, newspapers and dog food.',
  'baner', 'Sample Road, Baner, Pune, Maharashtra 411045', 'https://maps.google.com/?q=Baner,Pune',
  null, null,
  '+91 00000 00000', '+910000000000', 'hello@example.org', 'https://example.org',
  'https://instagram.com/example', null, null, 'https://youtube.com/@example', null,
  2018, 'Society', 'SAMPLE-0002', 'Daily, 10 am – 6 pm', array['Marathi', 'English'],
  '/samples/paws-logo.svg', '/samples/paws-cover.svg',
  array['/samples/paws-cover.svg', '/samples/food-cover.svg'],
  true, 'published', true
),
(
  'sample-green-pune-collective',
  'Sample Green Pune Collective',
  'Tree plantation and river clean-ups across Pune.',
  E'This is a sample listing used to demo NGOConnect.\n\nA volunteer group that plants native trees on hills around the city and organises monthly clean-ups along the Mula–Mutha riverbanks.',
  array['Monthly riverbank clean-ups', 'Native tree plantation drives in monsoon', 'Composting workshops for housing societies'],
  array['environment'],
  array['volunteer', 'events-drives', 'pro-bono'],
  null,
  'aundh', null, 'https://maps.google.com/?q=Aundh,Pune',
  18.559, 73.8078,
  null, '+910000000000', 'hello@example.org', null,
  'https://instagram.com/example', null, 'https://linkedin.com/company/example', null, null,
  2020, null, null, null, array['Marathi', 'English'],
  '/samples/green-logo.svg', '/samples/green-cover.svg', '{}',
  false, 'published', true
),
(
  'sample-annapurna-food-bank',
  'Sample Annapurna Food Bank',
  'Collecting surplus food and sharing it with families in need.',
  E'This is a sample listing used to demo NGOConnect.\n\nSample Annapurna Food Bank collects extra food from weddings, hostels and restaurants and delivers it to shelters and families in Hadapsar and nearby areas.',
  array['Daily surplus-food pickup', 'Monthly ration kits for families', 'Community kitchen on Sundays'],
  array['hunger-food'],
  array['donate-money', 'donate-items', 'volunteer'],
  'Volunteers with a two-wheeler are welcome for evening pickups.',
  'hadapsar', 'Sample Chowk, Hadapsar, Pune, Maharashtra 411028', 'https://maps.google.com/?q=Hadapsar,Pune',
  18.5089, 73.926,
  '+91 00000 00000', '+910000000000', 'hello@example.org', 'https://example.org',
  null, 'https://facebook.com/example', null, null, 'https://example.org/donate',
  2017, 'Section 8 Company', 'SAMPLE-0004', 'Mon–Sun, 9 am – 9 pm', array['Marathi', 'Hindi'],
  '/samples/food-logo.svg', '/samples/food-cover.svg',
  array['/samples/food-cover.svg', '/samples/seniors-cover.svg'],
  true, 'published', true
),
(
  'sample-saathi-senior-care',
  'Sample Saathi Senior Care',
  'Day care, health check-ups and company for senior citizens.',
  E'This is a sample listing used to demo NGOConnect.\n\nSample Saathi runs a day-care centre where senior citizens can spend the day together, with simple health check-ups, yoga and games.',
  array['Day-care centre for seniors', 'Free BP and sugar check-ups every Saturday', 'Phone check-ins for seniors living alone'],
  array['elderly-care', 'health-medical'],
  array['volunteer', 'donate-money', 'pro-bono'],
  'Doctors and nurses who can give 2 hours a month are especially welcome.',
  'nigdi', null, 'https://maps.google.com/?q=Nigdi,Pune',
  null, null,
  '+91 00000 00000', null, 'hello@example.org', null,
  null, null, null, null, null,
  2012, 'Trust', 'SAMPLE-0005', 'Mon–Fri, 9 am – 5 pm', array['Marathi', 'Hindi'],
  '/samples/seniors-logo.svg', '/samples/seniors-cover.svg', '{}',
  false, 'published', true
),
(
  'sample-udaan-womens-skills-centre',
  'Sample Udaan Women''s Skills Centre',
  'Tailoring, computer and money-management classes for women.',
  E'This is a sample listing used to demo NGOConnect.\n\nSample Udaan helps women earn an income through short skills courses, and connects them with local shops and small businesses.',
  array['3-month tailoring course', 'Basic computer and smartphone classes', 'Savings group meetings'],
  array['women-empowerment', 'skill-development'],
  array['internships', 'volunteer', 'donate-items'],
  'Old sewing machines in working condition are very useful.',
  'yerawada', 'Sample Nagar, Yerawada, Pune, Maharashtra 411006', 'https://maps.google.com/?q=Yerawada,Pune',
  18.553, 73.886,
  '+91 00000 00000', '+910000000000', null, 'https://example.org',
  'https://instagram.com/example', null, null, null, null,
  2019, 'Society', 'SAMPLE-0006', 'Tue–Sat, 11 am – 4 pm', array['Marathi', 'Hindi', 'Urdu'],
  '/samples/udaan-logo.svg', '/samples/udaan-cover.svg', '{}',
  false, 'published', true
),
(
  -- DRAFT: must never appear on the public site (used to test RLS).
  'sample-mind-matters-draft',
  'Sample Mind Matters (Draft)',
  'Draft entry — should not be visible publicly.',
  E'This is a sample DRAFT listing. If you can see it on the public site, something is wrong.',
  '{}',
  array['mental-health'],
  array['volunteer'],
  null,
  'viman-nagar', null, null, null, null,
  null, null, null, null, null, null, null, null, null,
  null, null, null, null, '{}',
  '/samples/mind-logo.svg', '/samples/mind-cover.svg', '{}',
  false, 'draft', true
);

insert into public.ngo_private (ngo_id, contact_person, contact_person_phone, internal_notes, data_received_on)
select id, 'Sample Contact', '+91 00000 00000', 'Fictional sample entry.', current_date
from public.ngos where is_sample;
