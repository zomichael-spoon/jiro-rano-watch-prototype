INSERT INTO public.fokontany (id, name, district, lat, lng, created_at)
VALUES
  -- 1. Tanàna Ambony (Haute Ville)
  (gen_random_uuid(), 'Ambalandapa', 'Fianarantsoa - Tanàna Ambony', -21.4538, 47.0705, NOW()),
  (gen_random_uuid(), 'Ambalapaiso', 'Fianarantsoa - Tanàna Ambony', -21.4580, 47.0760, NOW()),
  (gen_random_uuid(), 'Ambatolahikosoa', 'Fianarantsoa - Tanàna Ambony', -21.4542, 47.0745, NOW()),
  (gen_random_uuid(), 'Ambatovory', 'Fianarantsoa - Tanàna Ambony', -21.4520, 47.0755, NOW()),
  (gen_random_uuid(), 'Ambodiharana', 'Fianarantsoa - Tanàna Ambony', -21.4570, 47.0715, NOW()),
  (gen_random_uuid(), 'Ampitakely', 'Fianarantsoa - Tanàna Ambony', -21.4590, 47.0912, NOW()),
  (gen_random_uuid(), 'Andohanantady', 'Fianarantsoa - Tanàna Ambony', -21.4560, 47.0732, NOW()),
  (gen_random_uuid(), 'Isaha', 'Fianarantsoa - Tanàna Ambony', -21.4485, 47.0945, NOW()),
  (gen_random_uuid(), 'Rova', 'Fianarantsoa - Tanàna Ambony', -21.4531, 47.0728, NOW()),
  (gen_random_uuid(), 'Tsaramandroso', 'Fianarantsoa - Tanàna Ambony', -21.4565, 47.0842, NOW()),
  
  -- 2. Tanàna Ambany (Basse Ville)
  (gen_random_uuid(), 'Ambatomena', 'Fianarantsoa - Tanàna Ambany', -21.4505, 47.0793, NOW()),
  (gen_random_uuid(), 'Ankofafa Ambony', 'Fianarantsoa - Tanàna Ambany', -21.4320, 47.0795, NOW()),
  (gen_random_uuid(), 'Antarandolo', 'Fianarantsoa - Tanàna Ambany', -21.4460, 47.0840, NOW()),
  (gen_random_uuid(), 'Antsororokavo', 'Fianarantsoa - Tanàna Ambany', -21.4390, 47.0815, NOW()),
  (gen_random_uuid(), 'Bateravola', 'Fianarantsoa - Tanàna Ambany', -21.4425, 47.0860, NOW()),
  (gen_random_uuid(), 'Isada', 'Fianarantsoa - Tanàna Ambany', -21.4480, 47.0825, NOW()),
  (gen_random_uuid(), 'Ivory', 'Fianarantsoa - Tanàna Ambany', -21.4475, 47.0962, NOW()),
  (gen_random_uuid(), 'Mokàna', 'Fianarantsoa - Tanàna Ambany', -21.4420, 47.0970, NOW()),
  (gen_random_uuid(), 'Sahalava', 'Fianarantsoa - Tanàna Ambany', -21.4482, 47.0881, NOW()),
  (gen_random_uuid(), 'Talatamaty', 'Fianarantsoa - Tanàna Ambany', -21.4418, 47.0910, NOW()),
  (gen_random_uuid(), 'Tambohobe', 'Fianarantsoa - Tanàna Ambany', -21.4465, 47.0750, NOW()),
  (gen_random_uuid(), 'Tambohomandrevo', 'Fianarantsoa - Tanàna Ambany', -21.4495, 47.0770, NOW()),
  (gen_random_uuid(), 'Tanambao', 'Fianarantsoa - Tanàna Ambany', -21.4370, 47.0880, NOW()),
  
  -- 3. Manolafaka
  (gen_random_uuid(), 'Ambahisamotra', 'Fianarantsoa - Manolafaka', -21.4285, 47.0710, NOW()),
  (gen_random_uuid(), 'Ambalavato', 'Fianarantsoa - Manolafaka', -21.4250, 47.0740, NOW()),
  (gen_random_uuid(), 'Andremboasary', 'Fianarantsoa - Manolafaka', -21.4310, 47.0735, NOW()),
  (gen_random_uuid(), 'Ankofafa Ambany', 'Fianarantsoa - Manolafaka', -21.4362, 47.0790, NOW()),
  (gen_random_uuid(), 'Maromby', 'Fianarantsoa - Manolafaka', -21.4167, 47.0833, NOW()),
  
  -- 4. Andrainjato Avaratra (Nord)
  (gen_random_uuid(), 'Ambalabe', 'Fianarantsoa - Andrainjato Avaratra', -21.4725, 47.1060, NOW()),
  (gen_random_uuid(), 'Ambatolahy V', 'Fianarantsoa - Andrainjato Avaratra', -21.4680, 47.1090, NOW()),
  (gen_random_uuid(), 'Anjaninoro', 'Fianarantsoa - Andrainjato Avaratra', -21.4740, 47.1010, NOW()),
  (gen_random_uuid(), 'Antanifotsy V', 'Fianarantsoa - Andrainjato Avaratra', -21.4710, 47.1140, NOW()),
  (gen_random_uuid(), 'Beravina', 'Fianarantsoa - Andrainjato Avaratra', -21.4645, 47.1020, NOW()),
  (gen_random_uuid(), 'Idanda', 'Fianarantsoa - Andrainjato Avaratra', -21.4775, 47.1120, NOW()),
  (gen_random_uuid(), 'Soanierana', 'Fianarantsoa - Andrainjato Avaratra', -21.4685, 47.1005, NOW()),
  (gen_random_uuid(), 'Tsimanarirazana', 'Fianarantsoa - Andrainjato Avaratra', -21.4705, 47.1075, NOW()),
  
  -- 5. Andrainjato Atsimo (Sud)
  (gen_random_uuid(), 'Ambatoharanana', 'Fianarantsoa - Andrainjato Atsimo', -21.4820, 47.1025, NOW()),
  (gen_random_uuid(), 'Ambatomainty', 'Fianarantsoa - Andrainjato Atsimo', -21.4870, 47.1090, NOW()),
  (gen_random_uuid(), 'Ambodikavola', 'Fianarantsoa - Andrainjato Atsimo', -21.4840, 47.1110, NOW()),
  (gen_random_uuid(), 'Igaga', 'Fianarantsoa - Andrainjato Atsimo', -21.4805, 47.1040, NOW()),
  (gen_random_uuid(), 'Soatsihadino', 'Fianarantsoa - Andrainjato Atsimo', -21.4780, 47.1170, NOW()),
  
  -- 6. Lalazana
  (gen_random_uuid(), 'Ambatofolaka', 'Fianarantsoa - Lalazana', -21.4720, 47.0820, NOW()),
  (gen_random_uuid(), 'Ambatolahy II', 'Fianarantsoa - Lalazana', -21.4690, 47.0790, NOW()),
  (gen_random_uuid(), 'Ambodiharana Lalazana', 'Fianarantsoa - Lalazana', -21.4650, 47.0740, NOW()),
  (gen_random_uuid(), 'Amontana', 'Fianarantsoa - Lalazana', -21.4600, 47.0810, NOW()),
  (gen_random_uuid(), 'Mahazengy', 'Fianarantsoa - Lalazana', -21.4658, 47.0865, NOW()),
  (gen_random_uuid(), 'Mandriandalana', 'Fianarantsoa - Lalazana', -21.4625, 47.0845, NOW()),
  (gen_random_uuid(), 'Sahamavo', 'Fianarantsoa - Lalazana', -21.4760, 47.0770, NOW()),
  
  -- 7. Vatosola
  (gen_random_uuid(), 'Ambalamarina Kianjasoa', 'Fianarantsoa - Vatosola', -21.4850, 47.0910, NOW()),
  (gen_random_uuid(), 'Ambalambositra', 'Fianarantsoa - Vatosola', -21.4890, 47.0880, NOW()),
  (gen_random_uuid(), 'Anasana', 'Fianarantsoa - Vatosola', -21.4920, 47.0940, NOW()),
  (gen_random_uuid(), 'Ankazobe', 'Fianarantsoa - Vatosola', -21.4810, 47.0930, NOW()),
  (gen_random_uuid(), 'Antsaharoa', 'Fianarantsoa - Vatosola', -21.4865, 47.0955, NOW());