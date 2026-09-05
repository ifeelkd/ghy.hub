"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  RoleType,
  Project,
  ClientProfile,
  UserApplication,
  ApplicantCandidate,
  VerificationItem,
  ReportItem,
  RatingAggregate,
  RecruiterRating,
  Profile,
} from "@/types";
import { createClient } from "@/lib/supabase/client";

export const LANGS = [
  // Web & Frontend
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Vue.js",
  "Nuxt.js",
  "Angular",
  "Svelte",
  "SvelteKit",
  "HTML5 & CSS3",
  "Tailwind CSS",
  "Bootstrap",
  "Sass / SCSS",
  "GraphQL",
  "Redux / Zustand",
  // Mobile Development
  "Flutter",
  "React Native",
  "Swift",
  "SwiftUI",
  "Kotlin",
  "Java (Android)",
  "Dart",
  "Expo",
  // Backend & APIs
  "Node.js",
  "Express.js",
  "NestJS",
  "Python",
  "Django",
  "FastAPI",
  "Flask",
  "Go (Golang)",
  "Rust",
  "Java (Spring Boot)",
  "C# / .NET",
  "C++",
  "PHP",
  "Laravel",
  "Ruby on Rails",
  "REST APIs",
  "gRPC",
  // Database & Cloud
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Supabase",
  "Firebase",
  "Docker",
  "Kubernetes",
  "AWS",
  "Google Cloud (GCP)",
  "Microsoft Azure",
  "Vercel",
  "Linux / Bash",
  "Git & GitHub",
  // AI, Data & Machine Learning
  "PyTorch",
  "TensorFlow",
  "Pandas / NumPy",
  "Scikit-learn",
  "Hugging Face",
  "OpenAI API / LLMs",
  "LangChain",
  "Computer Vision / OpenCV",
  "Data Analysis / SQL",
  "Tableau",
  "Power BI",
  // Design, 3D & Creative Tools
  "Figma",
  "Adobe XD",
  "Photoshop",
  "Illustrator",
  "InDesign",
  "Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Lightroom",
  "Blender",
  "Cinema 4D",
  "Maya",
  "Canva",
  "Framer",
  "Webflow",
  "WordPress",
  "Shopify",
  "Wix / Squarespace",
  "Solidity / Web3",
];

export const SKILLS = [
  // Engineering & Development
  "Frontend Development",
  "Full Stack Development",
  "Backend Engineering",
  "Mobile App Development",
  "API Integration",
  "Database Design",
  "DevOps & CI/CD",
  "Cloud Architecture",
  "Cybersecurity & Auditing",
  "Microservices",
  "Automated Testing & QA",
  "Code Review & Refactoring",
  "Performance Optimization",
  "Web Scraping & Automation",
  // AI & Data
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing (NLP)",
  "Generative AI & Prompt Engineering",
  "Data Engineering",
  "Data Visualization",
  "Predictive Modeling",
  "Statistical Analysis",
  // UI/UX & Design
  "UI/UX Design",
  "Wireframing & Prototyping",
  "Design Systems",
  "Brand Identity & Logo Design",
  "Graphic Design",
  "Illustration",
  "Icon Design",
  "Packaging Design",
  "Print & Editorial Design",
  // Video, 3D & Audio
  "Video Editing",
  "Motion Graphics",
  "3D Modelling & Texturing",
  "3D Animation",
  "Color Grading",
  "Videography",
  "Photography",
  "Studio Lighting",
  "Drone Videography",
  "Sound Design & Audio Engineering",
  "Voice Acting & Voiceover",
  "Podcast Production",
  // Content & Marketing
  "Technical Writing",
  "Copywriting",
  "Content Writing & Blogging",
  "SEO (Search Engine Optimization)",
  "Content Strategy",
  "Social Media Marketing",
  "Performance Marketing",
  "Google Ads & PPC",
  "Meta Ads (Facebook/Instagram)",
  "Email Marketing & Automation",
  "Ghostwriting",
  "Scriptwriting",
  "Community Management",
  "Public Relations",
  // Business & Project Management
  "Product Management",
  "Agile / Scrum Coaching",
  "Business Analysis",
  "Market Research",
  "Financial Modeling",
  "Pitch Deck Design",
  // Teaching & Academics
  "Curriculum & Syllabus Design",
  "Exam Preparation & Strategy",
  "Interactive Lesson Planning",
  "One-on-One Tutoring",
  "Doubt Clearing & Mentorship",
  "Homework Support",
  "Academic Counseling",
  "STEM Project Guidance",
];

export const CITIES = [
  "Remote (Worldwide)",
  "Remote (India)",
  "Bengaluru, Karnataka",
  "Delhi NCR",
  "Mumbai, Maharashtra",
  "Hyderabad, Telangana",
  "Pune, Maharashtra",
  "Chennai, Tamil Nadu",
  "Kolkata, West Bengal",
  "Ahmedabad, Gujarat",
  "Jaipur, Rajasthan",
  "Chandigarh",
  "Kochi, Kerala",
  "Lucknow, Uttar Pradesh",
  "Indore, Madhya Pradesh",
  "Goa",
  "Bhopal, Madhya Pradesh",
  "Nagpur, Maharashtra",
  "Patna, Bihar",
  "Surat, Gujarat",
  "Vadodara, Gujarat",
  "Visakhapatnam, Andhra Pradesh",
  "Coimbatore, Tamil Nadu",
  "Bhubaneswar, Odisha",
  "Guwahati, Assam",
  "Thiruvananthapuram, Kerala",
  "Dehradun, Uttarakhand",
  "Varanasi, Uttar Pradesh",
  "Ranchi, Jharkhand",
  "Raipur, Chhattisgarh",
  "Mysuru, Karnataka",
  "Nicobar, Andaman and Nicobar Islands",
  "North and Middle Andaman, Andaman and Nicobar Islands",
  "South Andaman (Port Blair), Andaman and Nicobar Islands",
  "Alluri Sitharama Raju, Andhra Pradesh",
  "Anakapalli, Andhra Pradesh",
  "Ananthapuramu, Andhra Pradesh",
  "Annamayya, Andhra Pradesh",
  "Bapatla, Andhra Pradesh",
  "Chittoor, Andhra Pradesh",
  "Dr. B.R. Ambedkar Konaseema, Andhra Pradesh",
  "East Godavari (Rajahmundry), Andhra Pradesh",
  "Eluru, Andhra Pradesh",
  "Guntur, Andhra Pradesh",
  "Kakinada, Andhra Pradesh",
  "Krishna (Machilipatnam), Andhra Pradesh",
  "Kurnool, Andhra Pradesh",
  "Nandyal, Andhra Pradesh",
  "NTR (Vijayawada), Andhra Pradesh",
  "Palnadu, Andhra Pradesh",
  "Parvathipuram Manyam, Andhra Pradesh",
  "Prakasam (Ongole), Andhra Pradesh",
  "Sri Potti Sriramulu Nellore, Andhra Pradesh",
  "Sri Sathya Sai, Andhra Pradesh",
  "Srikakulam, Andhra Pradesh",
  "Tirupati, Andhra Pradesh",
  "Vizianagaram, Andhra Pradesh",
  "West Godavari (Bhimavaram), Andhra Pradesh",
  "YSR Kadapa, Andhra Pradesh",
  "Anjaw, Arunachal Pradesh",
  "Changlang, Arunachal Pradesh",
  "Dibang Valley, Arunachal Pradesh",
  "East Kameng, Arunachal Pradesh",
  "East Siang, Arunachal Pradesh",
  "Itanagar Capital Complex, Arunachal Pradesh",
  "Kamle, Arunachal Pradesh",
  "Kra Daadi, Arunachal Pradesh",
  "Kurung Kumey, Arunachal Pradesh",
  "Leparada, Arunachal Pradesh",
  "Lohit, Arunachal Pradesh",
  "Longding, Arunachal Pradesh",
  "Lower Dibang Valley, Arunachal Pradesh",
  "Lower Siang, Arunachal Pradesh",
  "Lower Subansiri, Arunachal Pradesh",
  "Namsai, Arunachal Pradesh",
  "Pakke Kessang, Arunachal Pradesh",
  "Papum Pare, Arunachal Pradesh",
  "Shi Yomi, Arunachal Pradesh",
  "Siang, Arunachal Pradesh",
  "Tawang, Arunachal Pradesh",
  "Tirap, Arunachal Pradesh",
  "Upper Siang, Arunachal Pradesh",
  "Upper Subansiri, Arunachal Pradesh",
  "West Kameng, Arunachal Pradesh",
  "West Siang, Arunachal Pradesh",
  "Baksa, Assam",
  "Barpeta, Assam",
  "Biswanath, Assam",
  "Bongaigaon, Assam",
  "Cachar (Silchar), Assam",
  "Charaideo, Assam",
  "Chirang, Assam",
  "Darrang (Mangaldai), Assam",
  "Dhemaji, Assam",
  "Dhubri, Assam",
  "Dibrugarh, Assam",
  "Dima Hasao (Haflong), Assam",
  "Goalpara, Assam",
  "Golaghat, Assam",
  "Hailakandi, Assam",
  "Hojai, Assam",
  "Jorhat, Assam",
  "Kamrup (Amingaon), Assam",
  "Kamrup Metropolitan (Guwahati), Assam",
  "Karbi Anglong (Diphu), Assam",
  "Karimganj, Assam",
  "Kokrajhar, Assam",
  "Lakhimpur (North Lakhimpur), Assam",
  "Majuli, Assam",
  "Morigaon, Assam",
  "Nagaon, Assam",
  "Nalbari, Assam",
  "Sivasagar, Assam",
  "Sonitpur (Tezpur), Assam",
  "South Salmara-Mankachar, Assam",
  "Tamulpur, Assam",
  "Tinsukia, Assam",
  "Udalguri, Assam",
  "West Karbi Anglong (Hamren), Assam",
  "Bajali, Assam",
  "Araria, Bihar",
  "Arwal, Bihar",
  "Aurangabad, Bihar",
  "Banka, Bihar",
  "Begusarai, Bihar",
  "Bhagalpur, Bihar",
  "Bhojpur (Ara), Bihar",
  "Buxar, Bihar",
  "Darbhanga, Bihar",
  "East Champaran (Motihari), Bihar",
  "Gaya, Bihar",
  "Gopalganj, Bihar",
  "Jamui, Bihar",
  "Jehanabad, Bihar",
  "Kaimur (Bhabua), Bihar",
  "Katihar, Bihar",
  "Khagaria, Bihar",
  "Kishanganj, Bihar",
  "Lakhisarai, Bihar",
  "Madhepura, Bihar",
  "Madhubani, Bihar",
  "Munger, Bihar",
  "Muzaffarpur, Bihar",
  "Nalanda (Bihar Sharif), Bihar",
  "Nawada, Bihar",
  "Purnia, Bihar",
  "Rohtas (Sasaram), Bihar",
  "Saharsa, Bihar",
  "Samastipur, Bihar",
  "Saran (Chhapra), Bihar",
  "Sheikhpura, Bihar",
  "Sheohar, Bihar",
  "Sitamarhi, Bihar",
  "Siwan, Bihar",
  "Supaul, Bihar",
  "Vaishali (Hajipur), Bihar",
  "West Champaran (Bettiah), Bihar",
  "Chandigarh, Chandigarh",
  "Balod, Chhattisgarh",
  "Baloda Bazar-Bhatapara, Chhattisgarh",
  "Balrampur-Ramanujganj, Chhattisgarh",
  "Bastar (Jagdalpur), Chhattisgarh",
  "Bemetara, Chhattisgarh",
  "Bijapur, Chhattisgarh",
  "Bilaspur, Chhattisgarh",
  "Dantewada (South Bastar), Chhattisgarh",
  "Dhamtari, Chhattisgarh",
  "Durg, Chhattisgarh",
  "Gariaband, Chhattisgarh",
  "Gaurela-Pendra-Marwahi, Chhattisgarh",
  "Janjgir-Champa, Chhattisgarh",
  "Jashpur, Chhattisgarh",
  "Kabirdham (Kawardha), Chhattisgarh",
  "Kanker (North Bastar), Chhattisgarh",
  "Khairagarh-Chhuikhadan-Gandai, Chhattisgarh",
  "Kondagaon, Chhattisgarh",
  "Korba, Chhattisgarh",
  "Koriya, Chhattisgarh",
  "Mahasamund, Chhattisgarh",
  "Manendragarh-Chirmiri-Bharatpur, Chhattisgarh",
  "Mohla-Manpur-Ambagarh Chowki, Chhattisgarh",
  "Mungeli, Chhattisgarh",
  "Narayanpur, Chhattisgarh",
  "Raigarh, Chhattisgarh",
  "Rajnandgaon, Chhattisgarh",
  "Sarangarh-Bilaigarh, Chhattisgarh",
  "Sakti, Chhattisgarh",
  "Sukma, Chhattisgarh",
  "Surajpur, Chhattisgarh",
  "Surguja (Ambikapur), Chhattisgarh",
  "Dadra and Nagar Haveli (Silvassa), Dadra and Nagar Haveli and Daman and Diu",
  "Daman, Dadra and Nagar Haveli and Daman and Diu",
  "Diu, Dadra and Nagar Haveli and Daman and Diu",
  "Central Delhi, Delhi",
  "East Delhi, Delhi",
  "New Delhi, Delhi",
  "North Delhi, Delhi",
  "North East Delhi, Delhi",
  "North West Delhi, Delhi",
  "Shahdara, Delhi",
  "South Delhi, Delhi",
  "South East Delhi, Delhi",
  "South West Delhi, Delhi",
  "West Delhi, Delhi",
  "North Goa (Panaji), Goa",
  "South Goa (Margao), Goa",
  "Amreli, Gujarat",
  "Anand, Gujarat",
  "Aravalli (Modasa), Gujarat",
  "Banaskantha (Palanpur), Gujarat",
  "Bharuch, Gujarat",
  "Bhavnagar, Gujarat",
  "Botad, Gujarat",
  "Chhota Udaipur, Gujarat",
  "Dahod, Gujarat",
  "Dang (Ahwa), Gujarat",
  "Devbhumi Dwarka (Khambhalia), Gujarat",
  "Gandhinagar, Gujarat",
  "Gir Somnath (Veraval), Gujarat",
  "Jamnagar, Gujarat",
  "Junagadh, Gujarat",
  "Kheda (Nadiad), Gujarat",
  "Kutch (Bhuj), Gujarat",
  "Mahisagar (Lunawada), Gujarat",
  "Mehsana, Gujarat",
  "Morbi, Gujarat",
  "Narmada (Rajpipla), Gujarat",
  "Navsari, Gujarat",
  "Panchmahal (Godhra), Gujarat",
  "Patan, Gujarat",
  "Porbandar, Gujarat",
  "Rajkot, Gujarat",
  "Sabarkantha (Himmatnagar), Gujarat",
  "Surendranagar, Gujarat",
  "Tapi (Vyara), Gujarat",
  "Valsad, Gujarat",
  "Ambala, Haryana",
  "Bhiwani, Haryana",
  "Charkhi Dadri, Haryana",
  "Faridabad, Haryana",
  "Fatehabad, Haryana",
  "Gurugram, Haryana",
  "Hisar, Haryana",
  "Jhajjar, Haryana",
  "Jind, Haryana",
  "Kaithal, Haryana",
  "Karnal, Haryana",
  "Kurukshetra, Haryana",
  "Mahendragarh (Narnaul), Haryana",
  "Nuh, Haryana",
  "Palwal, Haryana",
  "Panchkula, Haryana",
  "Panipat, Haryana",
  "Rewari, Haryana",
  "Rohtak, Haryana",
  "Sirsa, Haryana",
  "Sonipat, Haryana",
  "Yamunanagar, Haryana",
  "Bilaspur, Himachal Pradesh",
  "Chamba, Himachal Pradesh",
  "Hamirpur, Himachal Pradesh",
  "Kangra (Dharamshala), Himachal Pradesh",
  "Kinnaur (Reckong Peo), Himachal Pradesh",
  "Kullu, Himachal Pradesh",
  "Lahaul and Spiti (Keylong), Himachal Pradesh",
  "Mandi, Himachal Pradesh",
  "Shimla, Himachal Pradesh",
  "Sirmaur (Nahan), Himachal Pradesh",
  "Solan, Himachal Pradesh",
  "Una, Himachal Pradesh",
  "Anantnag, Jammu and Kashmir",
  "Bandipora, Jammu and Kashmir",
  "Baramulla, Jammu and Kashmir",
  "Budgam, Jammu and Kashmir",
  "Doda, Jammu and Kashmir",
  "Ganderbal, Jammu and Kashmir",
  "Jammu, Jammu and Kashmir",
  "Kathua, Jammu and Kashmir",
  "Kishtwar, Jammu and Kashmir",
  "Kulgam, Jammu and Kashmir",
  "Kupwara, Jammu and Kashmir",
  "Poonch, Jammu and Kashmir",
  "Pulwama, Jammu and Kashmir",
  "Rajouri, Jammu and Kashmir",
  "Ramban, Jammu and Kashmir",
  "Reasi, Jammu and Kashmir",
  "Samba, Jammu and Kashmir",
  "Shopian, Jammu and Kashmir",
  "Srinagar, Jammu and Kashmir",
  "Udhampur, Jammu and Kashmir",
  "Bokaro, Jharkhand",
  "Chatra, Jharkhand",
  "Deoghar, Jharkhand",
  "Dhanbad, Jharkhand",
  "Dumka, Jharkhand",
  "East Singhbhum (Jamshedpur), Jharkhand",
  "Garhwa, Jharkhand",
  "Giridih, Jharkhand",
  "Godda, Jharkhand",
  "Gumla, Jharkhand",
  "Hazaribagh, Jharkhand",
  "Jamtara, Jharkhand",
  "Khunti, Jharkhand",
  "Koderma, Jharkhand",
  "Latehar, Jharkhand",
  "Lohardaga, Jharkhand",
  "Pakur, Jharkhand",
  "Palamu (Daltonganj), Jharkhand",
  "Ramgarh, Jharkhand",
  "Sahebganj, Jharkhand",
  "Seraikela Kharsawan, Jharkhand",
  "Simdega, Jharkhand",
  "West Singhbhum (Chaibasa), Jharkhand",
  "Bagalkot, Karnataka",
  "Ballari, Karnataka",
  "Belagavi, Karnataka",
  "Bengaluru Rural, Karnataka",
  "Bengaluru Urban, Karnataka",
  "Bidar, Karnataka",
  "Chamarajanagar, Karnataka",
  "Chikkaballapur, Karnataka",
  "Chikkamagaluru, Karnataka",
  "Chitradurga, Karnataka",
  "Dakshina Kannada (Mangaluru), Karnataka",
  "Davanagere, Karnataka",
  "Dharwad (Hubballi), Karnataka",
  "Gadag, Karnataka",
  "Hassan, Karnataka",
  "Haveri, Karnataka",
  "Kalaburagi (Gulbarga), Karnataka",
  "Kodagu (Madikeri), Karnataka",
  "Kolar, Karnataka",
  "Koppal, Karnataka",
  "Mandya, Karnataka",
  "Raichur, Karnataka",
  "Ramanagara, Karnataka",
  "Shivamogga, Karnataka",
  "Tumakuru, Karnataka",
  "Udupi, Karnataka",
  "Uttara Kannada (Karwar), Karnataka",
  "Vijayanagara (Hosapete), Karnataka",
  "Vijayapura, Karnataka",
  "Yadgir, Karnataka",
  "Alappuzha, Kerala",
  "Ernakulam (Kochi), Kerala",
  "Idukki (Painavu), Kerala",
  "Kannur, Kerala",
  "Kasaragod, Kerala",
  "Kollam, Kerala",
  "Kottayam, Kerala",
  "Kozhikode, Kerala",
  "Malappuram, Kerala",
  "Palakkad, Kerala",
  "Pathanamthitta, Kerala",
  "Thrissur, Kerala",
  "Wayanad (Kalpetta), Kerala",
  "Kargil, Ladakh",
  "Leh, Ladakh",
  "Lakshadweep (Kavaratti), Lakshadweep",
  "Agar Malwa, Madhya Pradesh",
  "Alirajpur, Madhya Pradesh",
  "Anuppur, Madhya Pradesh",
  "Ashoknagar, Madhya Pradesh",
  "Balaghat, Madhya Pradesh",
  "Barwani, Madhya Pradesh",
  "Betul, Madhya Pradesh",
  "Bhind, Madhya Pradesh",
  "Burhanpur, Madhya Pradesh",
  "Chhatarpur, Madhya Pradesh",
  "Chhindwara, Madhya Pradesh",
  "Damoh, Madhya Pradesh",
  "Datia, Madhya Pradesh",
  "Dewas, Madhya Pradesh",
  "Dhar, Madhya Pradesh",
  "Dindori, Madhya Pradesh",
  "Guna, Madhya Pradesh",
  "Gwalior, Madhya Pradesh",
  "Harda, Madhya Pradesh",
  "Hoshangabad (Narmadapuram), Madhya Pradesh",
  "Jabalpur, Madhya Pradesh",
  "Jhabua, Madhya Pradesh",
  "Katni, Madhya Pradesh",
  "Khandwa, Madhya Pradesh",
  "Khargone, Madhya Pradesh",
  "Maihar, Madhya Pradesh",
  "Mandla, Madhya Pradesh",
  "Mandsaur, Madhya Pradesh",
  "Mauganj, Madhya Pradesh",
  "Morena, Madhya Pradesh",
  "Narsinghpur, Madhya Pradesh",
  "Neemuch, Madhya Pradesh",
  "Niwari, Madhya Pradesh",
  "Pandhurna, Madhya Pradesh",
  "Panna, Madhya Pradesh",
  "Raisen, Madhya Pradesh",
  "Rajgarh, Madhya Pradesh",
  "Ratlam, Madhya Pradesh",
  "Rewa, Madhya Pradesh",
  "Sagar, Madhya Pradesh",
  "Satna, Madhya Pradesh",
  "Sehore, Madhya Pradesh",
  "Seoni, Madhya Pradesh",
  "Shahdol, Madhya Pradesh",
  "Shajapur, Madhya Pradesh",
  "Sheopur, Madhya Pradesh",
  "Shivpuri, Madhya Pradesh",
  "Sidhi, Madhya Pradesh",
  "Singrauli, Madhya Pradesh",
  "Tikamgarh, Madhya Pradesh",
  "Ujjain, Madhya Pradesh",
  "Umaria, Madhya Pradesh",
  "Vidisha, Madhya Pradesh",
  "Ahmednagar (Ahilyanagar), Maharashtra",
  "Akola, Maharashtra",
  "Amravati, Maharashtra",
  "Chhatrapati Sambhaji Nagar (Aurangabad), Maharashtra",
  "Beed, Maharashtra",
  "Bhandara, Maharashtra",
  "Buldhana, Maharashtra",
  "Chandrapur, Maharashtra",
  "Dhule, Maharashtra",
  "Gadchiroli, Maharashtra",
  "Gondia, Maharashtra",
  "Hingoli, Maharashtra",
  "Jalgaon, Maharashtra",
  "Jalna, Maharashtra",
  "Kolhapur, Maharashtra",
  "Latur, Maharashtra",
  "Mumbai City, Maharashtra",
  "Mumbai Suburban, Maharashtra",
  "Nanded, Maharashtra",
  "Nandurbar, Maharashtra",
  "Nashik, Maharashtra",
  "Osmanabad (Dharashiv), Maharashtra",
  "Palghar, Maharashtra",
  "Parbhani, Maharashtra",
  "Raigad (Alibag), Maharashtra",
  "Ratnagiri, Maharashtra",
  "Sangli, Maharashtra",
  "Satara, Maharashtra",
  "Sindhudurg (Oros), Maharashtra",
  "Solapur, Maharashtra",
  "Thane, Maharashtra",
  "Wardha, Maharashtra",
  "Washim, Maharashtra",
  "Yavatmal, Maharashtra",
  "Bishnupur, Manipur",
  "Chandel, Manipur",
  "Churachandpur, Manipur",
  "Imphal East, Manipur",
  "Imphal West, Manipur",
  "Jiribam, Manipur",
  "Kakching, Manipur",
  "Kamjong, Manipur",
  "Kangpokpi, Manipur",
  "Noney, Manipur",
  "Pherzawl, Manipur",
  "Senapati, Manipur",
  "Tamenglong, Manipur",
  "Tengnoupal, Manipur",
  "Thoubal, Manipur",
  "Ukhrul, Manipur",
  "Eastern West Khasi Hills (Mairang), Meghalaya",
  "East Garo Hills (Williamnagar), Meghalaya",
  "East Jaintia Hills (Khliehriat), Meghalaya",
  "East Khasi Hills (Shillong), Meghalaya",
  "North Garo Hills (Resubelpara), Meghalaya",
  "Ri Bhoi (Nongpoh), Meghalaya",
  "South Garo Hills (Baghmara), Meghalaya",
  "South West Garo Hills (Ampati), Meghalaya",
  "South West Khasi Hills (Mawkyrwat), Meghalaya",
  "West Garo Hills (Tura), Meghalaya",
  "West Jaintia Hills (Jowai), Meghalaya",
  "West Khasi Hills (Nongstoin), Meghalaya",
  "Aizawl, Mizoram",
  "Champhai, Mizoram",
  "Hnahthial, Mizoram",
  "Khawzawl, Mizoram",
  "Kolasib, Mizoram",
  "Lawngtlai, Mizoram",
  "Lunglei, Mizoram",
  "Mamit, Mizoram",
  "Saitual, Mizoram",
  "Serchhip, Mizoram",
  "Siaha, Mizoram",
  "Chümoukedima, Nagaland",
  "Dimapur, Nagaland",
  "Kiphire, Nagaland",
  "Kohima, Nagaland",
  "Longleng, Nagaland",
  "Mokokchung, Nagaland",
  "Mon, Nagaland",
  "Niuland, Nagaland",
  "Noklak, Nagaland",
  "Peren, Nagaland",
  "Phek, Nagaland",
  "Shamator, Nagaland",
  "Tseminyü, Nagaland",
  "Tuensang, Nagaland",
  "Wokha, Nagaland",
  "Zunheboto, Nagaland",
  "Angul, Odisha",
  "Balangir, Odisha",
  "Balasore, Odisha",
  "Bargarh, Odisha",
  "Bhadrak, Odisha",
  "Boudh, Odisha",
  "Cuttack, Odisha",
  "Deogarh, Odisha",
  "Dhenkanal, Odisha",
  "Gajapati (Paralakhemundi), Odisha",
  "Ganjam (Chhatrapur/Berhampur), Odisha",
  "Jagatsinghpur, Odisha",
  "Jajpur, Odisha",
  "Jharsuguda, Odisha",
  "Kalahandi (Bhawanipatna), Odisha",
  "Kandhamal (Phulbani), Odisha",
  "Kendrapara, Odisha",
  "Kendujhar (Keonjhar), Odisha",
  "Khordha (Bhubaneswar), Odisha",
  "Koraput, Odisha",
  "Malkangiri, Odisha",
  "Mayurbhanj (Baripada), Odisha",
  "Nabarangpur, Odisha",
  "Nayagarh, Odisha",
  "Nuapada, Odisha",
  "Puri, Odisha",
  "Rayagada, Odisha",
  "Sambalpur, Odisha",
  "Subarnapur (Sonepur), Odisha",
  "Sundargarh (Rourkela), Odisha",
  "Karaikal, Puducherry",
  "Mahe, Puducherry",
  "Puducherry, Puducherry",
  "Yanam, Puducherry",
  "Amritsar, Punjab",
  "Barnala, Punjab",
  "Bathinda, Punjab",
  "Faridkot, Punjab",
  "Fatehgarh Sahib, Punjab",
  "Fazilka, Punjab",
  "Ferozepur, Punjab",
  "Gurdaspur, Punjab",
  "Hoshiarpur, Punjab",
  "Jalandhar, Punjab",
  "Kapurthala, Punjab",
  "Ludhiana, Punjab",
  "Malerkotla, Punjab",
  "Mansa, Punjab",
  "Moga, Punjab",
  "Muktsar, Punjab",
  "Pathankot, Punjab",
  "Patiala, Punjab",
  "Rupnagar (Ropar), Punjab",
  "Sahibzada Ajit Singh Nagar (Mohali), Punjab",
  "Sangrur, Punjab",
  "Shahid Bhagat Singh Nagar (Nawanshahr), Punjab",
  "Tarn Taran, Punjab",
  "Ajmer, Rajasthan",
  "Alwar, Rajasthan",
  "Anupgarh, Rajasthan",
  "Balotra, Rajasthan",
  "Banswara, Rajasthan",
  "Baran, Rajasthan",
  "Barmer, Rajasthan",
  "Beawar, Rajasthan",
  "Bharatpur, Rajasthan",
  "Bhilwara, Rajasthan",
  "Bikaner, Rajasthan",
  "Bundi, Rajasthan",
  "Chittorgarh, Rajasthan",
  "Churu, Rajasthan",
  "Dausa, Rajasthan",
  "Deeg, Rajasthan",
  "Dholpur, Rajasthan",
  "Didwana-Kuchaman, Rajasthan",
  "Dudu, Rajasthan",
  "Dungarpur, Rajasthan",
  "Gangapur City, Rajasthan",
  "Hanumangarh, Rajasthan",
  "Jaipur Rural, Rajasthan",
  "Jaisalmer, Rajasthan",
  "Jalore, Rajasthan",
  "Jhalawar, Rajasthan",
  "Jhunjhunu, Rajasthan",
  "Jodhpur, Rajasthan",
  "Jodhpur Rural, Rajasthan",
  "Karauli, Rajasthan",
  "Kekri, Rajasthan",
  "Khairthal-Tijara, Rajasthan",
  "Kota, Rajasthan",
  "Kotputli-Behror, Rajasthan",
  "Nagaur, Rajasthan",
  "Neem Ka Thana, Rajasthan",
  "Pali, Rajasthan",
  "Phalodi, Rajasthan",
  "Pratapgarh, Rajasthan",
  "Rajsamand, Rajasthan",
  "Salumbar, Rajasthan",
  "Sanchore, Rajasthan",
  "Sawai Madhopur, Rajasthan",
  "Shahpura, Rajasthan",
  "Sikar, Rajasthan",
  "Sirohi, Rajasthan",
  "Sri Ganganagar, Rajasthan",
  "Tonk, Rajasthan",
  "Udaipur, Rajasthan",
  "Gangtok, Sikkim",
  "Geyzing, Sikkim",
  "Namchi, Sikkim",
  "Mangan, Sikkim",
  "Pakyong, Sikkim",
  "Soreng, Sikkim",
  "Ariyalur, Tamil Nadu",
  "Chengalpattu, Tamil Nadu",
  "Cuddalore, Tamil Nadu",
  "Dharmapuri, Tamil Nadu",
  "Dindigul, Tamil Nadu",
  "Erode, Tamil Nadu",
  "Kallakurichi, Tamil Nadu",
  "Kanchipuram, Tamil Nadu",
  "Kanyakumari (Nagercoil), Tamil Nadu",
  "Karur, Tamil Nadu",
  "Krishnagiri, Tamil Nadu",
  "Madurai, Tamil Nadu",
  "Mayiladuthurai, Tamil Nadu",
  "Nagapattinam, Tamil Nadu",
  "Namakkal, Tamil Nadu",
  "Nilgiris (Ooty), Tamil Nadu",
  "Perambalur, Tamil Nadu",
  "Pudukkottai, Tamil Nadu",
  "Ramanathapuram, Tamil Nadu",
  "Ranipet, Tamil Nadu",
  "Salem, Tamil Nadu",
  "Sivaganga, Tamil Nadu",
  "Tenkasi, Tamil Nadu",
  "Thanjavur, Tamil Nadu",
  "Theni, Tamil Nadu",
  "Thoothukudi (Tuticorin), Tamil Nadu",
  "Tiruchirappalli (Trichy), Tamil Nadu",
  "Tirunelveli, Tamil Nadu",
  "Tirupathur, Tamil Nadu",
  "Tiruppur, Tamil Nadu",
  "Tiruvallur, Tamil Nadu",
  "Tiruvannamalai, Tamil Nadu",
  "Tiruvarur, Tamil Nadu",
  "Vellore, Tamil Nadu",
  "Viluppuram, Tamil Nadu",
  "Virudhunagar, Tamil Nadu",
  "Adilabad, Telangana",
  "Bhadradri Kothagudem, Telangana",
  "Hanumakonda, Telangana",
  "Jagtial, Telangana",
  "Jangaon, Telangana",
  "Jayashankar Bhupalpally, Telangana",
  "Jogulamba Gadwal, Telangana",
  "Kamareddy, Telangana",
  "Karimnagar, Telangana",
  "Khammam, Telangana",
  "Kumuram Bheem Asifabad, Telangana",
  "Mahabubabad, Telangana",
  "Mahabubnagar, Telangana",
  "Mancherial, Telangana",
  "Medak, Telangana",
  "Medchal-Malkajgiri, Telangana",
  "Mulugu, Telangana",
  "Nagarkurnool, Telangana",
  "Nalgonda, Telangana",
  "Narayanpet, Telangana",
  "Nirmal, Telangana",
  "Nizamabad, Telangana",
  "Peddapalli, Telangana",
  "Rajanna Sircilla, Telangana",
  "Ranga Reddy, Telangana",
  "Sangareddy, Telangana",
  "Siddipet, Telangana",
  "Suryapet, Telangana",
  "Vikarabad, Telangana",
  "Wanaparthy, Telangana",
  "Warangal, Telangana",
  "Yadadri Bhuvanagiri, Telangana",
  "Dhalai (Ambassa), Tripura",
  "Gomati (Udaipur), Tripura",
  "Khowai, Tripura",
  "North Tripura (Dharmanagar), Tripura",
  "Sepahijala (Bishramganj), Tripura",
  "South Tripura (Belonia), Tripura",
  "Unakoti (Kailashahar), Tripura",
  "West Tripura (Agartala), Tripura",
  "Agra, Uttar Pradesh",
  "Aligarh, Uttar Pradesh",
  "Ambedkar Nagar, Uttar Pradesh",
  "Amethi, Uttar Pradesh",
  "Amroha, Uttar Pradesh",
  "Auraiya, Uttar Pradesh",
  "Ayodhya, Uttar Pradesh",
  "Azamgarh, Uttar Pradesh",
  "Baghpat, Uttar Pradesh",
  "Bahraich, Uttar Pradesh",
  "Ballia, Uttar Pradesh",
  "Balrampur, Uttar Pradesh",
  "Banda, Uttar Pradesh",
  "Barabanki, Uttar Pradesh",
  "Bareilly, Uttar Pradesh",
  "Basti, Uttar Pradesh",
  "Bhadohi (Sant Ravidas Nagar), Uttar Pradesh",
  "Bijnor, Uttar Pradesh",
  "Budaun, Uttar Pradesh",
  "Bulandshahr, Uttar Pradesh",
  "Chandauli, Uttar Pradesh",
  "Chitrakoot, Uttar Pradesh",
  "Deoria, Uttar Pradesh",
  "Etah, Uttar Pradesh",
  "Etawah, Uttar Pradesh",
  "Farrukhabad, Uttar Pradesh",
  "Fatehpur, Uttar Pradesh",
  "Firozabad, Uttar Pradesh",
  "Gautam Buddha Nagar (Noida / Greater Noida), Uttar Pradesh",
  "Ghaziabad, Uttar Pradesh",
  "Ghazipur, Uttar Pradesh",
  "Gonda, Uttar Pradesh",
  "Gorakhpur, Uttar Pradesh",
  "Hamirpur, Uttar Pradesh",
  "Hapur, Uttar Pradesh",
  "Hardoi, Uttar Pradesh",
  "Hathras, Uttar Pradesh",
  "Jalaun (Orai), Uttar Pradesh",
  "Jaunpur, Uttar Pradesh",
  "Jhansi, Uttar Pradesh",
  "Kannauj, Uttar Pradesh",
  "Kanpur Dehat, Uttar Pradesh",
  "Kanpur Nagar, Uttar Pradesh",
  "Kasganj, Uttar Pradesh",
  "Kaushambi, Uttar Pradesh",
  "Kheri (Lakhimpur), Uttar Pradesh",
  "Kushinagar, Uttar Pradesh",
  "Lalitpur, Uttar Pradesh",
  "Maharajganj, Uttar Pradesh",
  "Mahoba, Uttar Pradesh",
  "Mainpuri, Uttar Pradesh",
  "Mathura, Uttar Pradesh",
  "Mau, Uttar Pradesh",
  "Meerut, Uttar Pradesh",
  "Mirzapur, Uttar Pradesh",
  "Moradabad, Uttar Pradesh",
  "Muzaffarnagar, Uttar Pradesh",
  "Pilibhit, Uttar Pradesh",
  "Pratapgarh, Uttar Pradesh",
  "Prayagraj (Allahabad), Uttar Pradesh",
  "Raebareli, Uttar Pradesh",
  "Rampur, Uttar Pradesh",
  "Saharanpur, Uttar Pradesh",
  "Sambhal, Uttar Pradesh",
  "Sant Kabir Nagar, Uttar Pradesh",
  "Shahjahanpur, Uttar Pradesh",
  "Shamli, Uttar Pradesh",
  "Shravasti, Uttar Pradesh",
  "Siddharthnagar, Uttar Pradesh",
  "Sitapur, Uttar Pradesh",
  "Sonbhadra, Uttar Pradesh",
  "Sultanpur, Uttar Pradesh",
  "Unnao, Uttar Pradesh",
  "Almora, Uttarakhand",
  "Bageshwar, Uttarakhand",
  "Chamoli (Gopeshwar), Uttarakhand",
  "Champawat, Uttarakhand",
  "Haridwar, Uttarakhand",
  "Nainital, Uttarakhand",
  "Pauri Garhwal, Uttarakhand",
  "Pithoragarh, Uttarakhand",
  "Rudraprayag, Uttarakhand",
  "Tehri Garhwal (New Tehri), Uttarakhand",
  "Udham Singh Nagar (Rudrapur), Uttarakhand",
  "Uttarkashi, Uttarakhand",
  "Alipurduar, West Bengal",
  "Bankura, West Bengal",
  "Birbhum (Suri), West Bengal",
  "Cooch Behar, West Bengal",
  "Dakshin Dinajpur (Balurghat), West Bengal",
  "Darjeeling, West Bengal",
  "Hooghly (Chinsurah), West Bengal",
  "Howrah, West Bengal",
  "Jalpaiguri, West Bengal",
  "Jhargram, West Bengal",
  "Kalimpong, West Bengal",
  "Malda (English Bazar), West Bengal",
  "Murshidabad (Baharampur), West Bengal",
  "Nadia (Krishnanagar), West Bengal",
  "North 24 Parganas (Barasat), West Bengal",
  "Paschim Bardhaman (Asansol/Durgapur), West Bengal",
  "Paschim Medinipur (Midnapore), West Bengal",
  "Purba Bardhaman (Bardhaman), West Bengal",
  "Purba Medinipur (Tamluk), West Bengal",
  "Purulia, West Bengal",
  "South 24 Parganas (Alipore), West Bengal",
  "Uttar Dinajpur (Raiganj), West Bengal",
  "San Francisco Bay Area, USA",
  "New York, USA",
  "Seattle, USA",
  "Austin, USA",
  "Boston, USA",
  "Los Angeles, USA",
  "Chicago, USA",
  "London, UK",
  "Berlin, Germany",
  "Munich, Germany",
  "Amsterdam, Netherlands",
  "Paris, France",
  "Dublin, Ireland",
  "Zurich, Switzerland",
  "Stockholm, Sweden",
  "Toronto, Canada",
  "Vancouver, Canada",
  "Singapore",
  "Dubai, UAE",
  "Tokyo, Japan",
  "Seoul, South Korea",
  "Sydney, Australia",
  "Melbourne, Australia",
];

export const FORMATS = [
  "Teaching & Tutoring",
  "Academic Mentorship",
  "Test Prep Coaching",
  "Language Instruction",
  "Web Development",
  "Mobile App Development",
  "UI/UX Design",
  "Graphic Design",
  "Branding & Identity",
  "Video Editing",
  "Videography & Production",
  "Photography",
  "3D & Motion Graphics",
  "Content Writing & Copy",
  "Technical Writing",
  "SEO & Growth Marketing",
  "Social Media Management",
  "Voice Over & Audio",
  "AI & Machine Learning",
  "Cloud & DevOps Architecture",
  "WordPress & Shopify",
  "Web3 & Blockchain",
  "Consulting & Advisory",
];

export const TEACHING_SUBJECTS = [
  // STEM Subjects
  "Mathematics (Algebra, Geometry, Trigonometry)",
  "Advanced Mathematics & Calculus",
  "Applied Mathematics & Statistics",
  "Vedic Mathematics & Mental Math",
  "Physics (Mechanics, Electromagnetism, Modern)",
  "Chemistry (Physical, Organic, Inorganic)",
  "Biology (Botany, Zoology, Genetics)",
  "Biotechnology & Biochemistry",
  "Computer Science (Python, Java, C++)",
  "Web Development & Coding for Kids",
  "Data Science & Artificial Intelligence",
  "Robotics & Electronics",
  // Commerce & Business
  "Accountancy & Financial Accounting",
  "Business Studies & Management",
  "Economics (Micro & Macro)",
  "Cost & Management Accounting",
  // Humanities & Social Sciences
  "English Literature & Composition",
  "English Language, Grammar & Spoken English",
  "History & World Civilizations",
  "Geography & Environmental Studies",
  "Political Science & Civics",
  "Psychology",
  "Sociology",
  "Philosophy",
  // Global & Regional Languages
  "Hindi",
  "Sanskrit",
  "French",
  "German",
  "Spanish",
  "Mandarin Chinese",
  "Japanese",
  "Arabic",
  "Italian",
  "Russian",
  "Regional Languages (Bengali, Tamil, Telugu, Marathi, etc.)",
  // Competitive Exams & Test Prep
  "IIT-JEE (Main & Advanced) — Physics, Chemistry, Math",
  "NEET-UG — Physics, Chemistry, Biology",
  "SAT / ACT (US College Admissions)",
  "AP (Advanced Placement) Exam Prep",
  "IB Diploma Subject Coaching",
  "CUET (Common University Entrance Test)",
  "IELTS / TOEFL / PTE (English Proficiency)",
  "GRE / GMAT (Graduate Admissions)",
  "CAT / MBA Entrance Prep",
  "UPSC / Civil Services Foundation",
  "Olympiads (Math, Science, Cyber)",
  // Creative & Performing Arts
  "Vocal Music (Indian Classical / Western)",
  "Instrumental Music (Guitar, Piano, Keyboard, Violin, Drums)",
  "Fine Arts, Sketching & Oil/Acrylic Painting",
  "Digital Art & Graphic Design",
  "Chess Tactics & Mastery",
  "Yoga & Mindfulness",
];

export const EDUCATION_LEVELS = [
  "Early Childhood / Kindergarten",
  "Primary School (Grades 1–5)",
  "Middle School (Grades 6–8)",
  "Secondary (Grades 9–10)",
  "Senior Secondary (Grades 11–12)",
  "College / Undergraduate (B.Tech, B.Sc, B.Com, B.A.)",
  "Postgraduate & Masters (M.Tech, M.Sc, MBA)",
  "Competitive Exam Aspirants",
  "Adult Learners & Working Professionals",
];

export const EDUCATION_BOARDS = [
  "CBSE (Central Board of Secondary Education)",
  "ICSE / ISC (Council for the Indian School Certificate Examinations)",
  "State Board (State-Specific Curriculum)",
  "IB (International Baccalaureate — PYP, MYP, DP)",
  "Cambridge International (IGCSE, AS & A Levels)",
  "AP (College Board Advanced Placement)",
  "American High School Diploma / US Common Core",
  "UK National Curriculum / GCSE",
  "Canadian Provincial Curriculum",
  "Australian Curriculum (ATAR)",
  "University / Degree Curriculum",
  "General / Open Learning",
];

export const TEACHER_QUALIFICATIONS = [
  "B.Ed (Bachelor of Education)",
  "M.Ed (Master of Education)",
  "Ph.D. / Doctorate Scholar",
  "Postgraduate (M.Sc / M.A. / M.Com / M.Tech)",
  "Graduate (B.Sc / B.A. / B.Com / B.Tech)",
  "CTET / State TET Qualified",
  "IB / Cambridge Certified Educator",
  "IIT / NIT / Top Tier Alumni",
  "Professional Certified Tutor",
  "Industry Subject Specialist",
];

export const TEACHING_MODES = [
  "Online 1-on-1 (Personalized)",
  "Online Small Group (2–5 students)",
  "Online Batch / Classroom (6+ students)",
  "In-Person / Home Tutoring",
  "Hybrid (Online + In-Person Sessions)",
];

export const TEACHING_TOOLS = [
  "Zoom",
  "Google Meet",
  "Miro Interactive Whiteboard",
  "GeoGebra",
  "LaTeX / Overleaf",
  "Google Classroom",
  "Kahoot & Quizizz",
  "Khan Academy",
  "OneNote / Wacom Digital Pen",
  "Notion Workspace",
  "PhET Interactive Simulations",
  "Microsoft Teams",
  "Desmos Graphing Calculator",
];

export const LANGUAGES_OF_INSTRUCTION = [
  "English",
  "Hindi",
  "Bilingual (English + Hindi)",
  "Spanish",
  "French",
  "German",
  "Mandarin Chinese",
  "Arabic",
  "Bengali",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Gujarati",
  "Punjabi",
  "Urdu",
];

export interface Session {
  role: RoleType;
  name: string;
  rid?: string | null;
  profile?: Profile;
}

interface ToastMessage {
  id: string;
  text: string;
}

interface MarketplaceContextType {
  session: Session | null;
  projects: Project[];
  clients: Record<string, ClientProfile>;
  myApps: UserApplication[];
  applicantLanes: Record<string, ApplicantCandidate[]>;
  verifQueue: VerificationItem[];
  reportsQueue: ReportItem[];
  toasts: ToastMessage[];
  isLoading: boolean;
  loginAsDemo: (role: RoleType) => void;
  signIn: (role: RoleType, name: string, rid?: string) => void;
  signOut: () => void;
  showToast: (text: string) => void;
  aggregateRatings: (rid: string) => RatingAggregate;
  hasApplied: (roleId: number) => boolean;
  submitApplication: (roleId: number, note?: string, sampleUrl?: string) => Promise<boolean>;
  submitRating: (roleId: number, rating: { overall: number; responded: boolean | 'na'; described: boolean | 'na'; paid: boolean | 'na'; note: string }) => Promise<boolean>;
  moveApplicant: (fromLane: string, index: number, toLane: string) => Promise<void>;
  postProject: (project: Omit<Project, "id">) => Promise<number>;
  adminAction: (index: number, queueType: "verif" | "reports", action: "approved" | "rejected" | "removed" | "dismissed") => Promise<void>;
  updateFreelancerProfile: (profile: Partial<Profile>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Record<string, ClientProfile>>({});
  const [myApps, setMyApps] = useState<UserApplication[]>([]);
  const [applicantLanes, setApplicantLanes] = useState<Record<string, ApplicantCandidate[]>>({
    new: [],
    short: [],
    maybe: [],
    rej: [],
  });
  const [verifQueue, setVerifQueue] = useState<VerificationItem[]>([]);
  const [reportsQueue, setReportsQueue] = useState<ReportItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const showToast = useCallback((text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  // Fetch live Supabase data on mount
  const refreshData = useCallback(async () => {
    const supabase = createClient();
    if (supabase) {
      try {
        // 1. Fetch live projects from Supabase
        const { data: dbProjects, error: projErr } = await supabase
          .from("projects")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (!projErr) {
          if (dbProjects && dbProjects.length > 0) {
            const mappedProjects: Project[] = dbProjects.map((p) => ({
              id: p.id,
              rid: p.client_id || "client",
              role: p.role_title,
              project: p.title,
              format: p.category,
              city: p.city,
              paid: p.compensation_type === "Unpaid" ? "Unpaid" : p.compensation_type === "Hourly" ? "Hourly" : "Paid",
              comp: p.compensation_details,
              deadline: p.deadline,
              window: p.is_flexible_dates ? "Dates not locked" : `${p.start_date || ""}–${p.end_date || ""}`,
              langs: p.required_tools || [],
              age: `₹${p.budget_min?.toLocaleString("en-IN") || 0}–${p.budget_max?.toLocaleString("en-IN") || 0}`,
              gender: p.experience_required || "Any",
              mode: p.interview_mode || "Async",
              skills: p.additional_skills || [],
              desc: p.description,
              status: p.status,
            }));
            setProjects(mappedProjects);
          } else {
            // Live database is empty
            setProjects([]);
          }
        }

        // 2. Fetch live profiles from Supabase
        const { data: dbProfiles } = await supabase.from("profiles").select("*");
        if (dbProfiles) {
          const clientMap: Record<string, ClientProfile> = {};
          dbProfiles.forEach((p) => {
            if (p.role === "client" || p.role === "indie") {
              clientMap[p.id] = {
                id: p.id,
                org: p.org || p.name,
                person: p.person || p.name,
                verify: p.verified_tier || "Identity verified",
                since: p.verified_since || "2026",
                city: p.city || "Mumbai",
                ratings: [],
              };
            }
          });
          setClients(clientMap);
        }

        // 3. Fetch ratings
        const { data: dbRatings } = await supabase.from("ratings").select("*");
        if (dbRatings && dbRatings.length > 0) {
          setClients((prevClients) => {
            const updated = { ...prevClients };
            dbRatings.forEach((r) => {
              const client = updated[r.client_id];
              if (client) {
                const ratingObj: RecruiterRating = {
                  by: "Verified Freelancer",
                  date: new Date(r.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
                  overall: r.overall,
                  responded: r.responded === "true" ? true : r.responded === "false" ? false : "na",
                  described: r.described === "true" ? true : r.described === "false" ? false : "na",
                  paid: r.paid === "true" ? true : r.paid === "false" ? false : "na",
                  note: r.note || "",
                };
                client.ratings = [ratingObj, ...client.ratings.filter((x) => x.note !== r.note)];
              }
            });
            return updated;
          });
        }
      } catch (e) {
        console.warn("Supabase fetch error:", e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("brief_session");
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }
    } catch (e) {}
    refreshData();
  }, [refreshData]);

  const loginAsDemo = (role: RoleType) => {
    const names: Record<RoleType, { name: string; rid?: string }> = {
      freelancer: { name: "Freelancer" },
      client: { name: "Client Account", rid: "client" },
      indie: { name: "Independent Client", rid: "indie" },
      admin: { name: "Admin Desk" },
    };
    const user = names[role];
    signIn(role, user.name, user.rid);
  };

  const signIn = (role: RoleType, name: string, rid?: string) => {
    const newSession: Session = {
      role,
      name,
      rid: rid || (role === "client" ? "client" : role === "indie" ? "indie" : null),
    };
    setSession(newSession);
    try {
      localStorage.setItem("brief_session", JSON.stringify(newSession));
    } catch (e) {}
    showToast(`Signed in as ${name}.`);
  };

  const signOut = () => {
    setSession(null);
    try {
      localStorage.removeItem("brief_session");
      localStorage.removeItem("brief_projects");
      localStorage.removeItem("brief_myapps");
    } catch (e) {}
    showToast("Signed out.");
  };

  const aggregateRatings = (rid: string): RatingAggregate => {
    const r = clients[rid];
    if (!r || !r.ratings || !r.ratings.length) {
      return { n: 0, avg: "0.0", responded: null, described: null, paid: null, respN: 0, descN: 0, paidN: 0 };
    }
    const list = r.ratings;
    const n = list.length;
    let sum = 0;
    const resp = [0, 0];
    const desc = [0, 0];
    const paid = [0, 0];

    for (let i = 0; i < n; i++) {
      const x = list[i];
      sum += x.overall;
      if (x.responded !== "na") {
        resp[1]++;
        if (x.responded === true) resp[0]++;
      }
      if (x.described !== "na") {
        desc[1]++;
        if (x.described === true) desc[0]++;
      }
      if (x.paid !== "na") {
        paid[1]++;
        if (x.paid === true) paid[0]++;
      }
    }

    const pc = (a: number[]) => (a[1] ? Math.round((a[0] / a[1]) * 100) : null);

    return {
      n,
      avg: (sum / n).toFixed(1),
      responded: pc(resp),
      described: pc(desc),
      paid: pc(paid),
      respN: resp[1],
      descN: desc[1],
      paidN: paid[1],
    };
  };

  const hasApplied = (roleId: number) => {
    return myApps.some((a) => a.roleId === roleId);
  };

  const submitApplication = async (roleId: number, note?: string, sampleUrl?: string): Promise<boolean> => {
    if (hasApplied(roleId)) {
      showToast("Already applied to this project.");
      return false;
    }

    const newApp: UserApplication = {
      roleId,
      status: "New",
      applied: "Today",
      rated: false,
      note,
      sampleUrl,
    };
    const updated = [newApp, ...myApps];
    setMyApps(updated);
    try {
      localStorage.setItem("brief_myapps", JSON.stringify(updated));
    } catch (e) {}

    // Add candidate to applicant lanes
    const candidate: ApplicantCandidate = {
      n: session?.name || "Applicant",
      c: "Verified Profile",
      note: note || "Application submitted.",
      sampleUrl,
    };
    setApplicantLanes((prev) => ({
      ...prev,
      new: [candidate, ...prev.new],
    }));

    // Send to Supabase if connected
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("applications").insert({
          project_id: roleId,
          note,
          work_sample_url: sampleUrl,
          status: "new",
        });
      } catch (err) {
        console.warn("Supabase application insert note:", err);
      }
    }

    showToast("Application submitted.");
    return true;
  };

  const submitRating = async (
    roleId: number,
    ratingData: { overall: number; responded: boolean | "na"; described: boolean | "na"; paid: boolean | "na"; note: string }
  ): Promise<boolean> => {
    const appIndex = myApps.findIndex((a) => a.roleId === roleId);
    if (appIndex < 0 || myApps[appIndex].rated) {
      showToast("Cannot rate this project.");
      return false;
    }
    const project = projects.find((p) => p.id === roleId);
    if (!project) return false;

    const newRating: RecruiterRating = {
      by: session?.name || "Freelancer",
      date: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
      overall: ratingData.overall,
      responded: ratingData.responded,
      described: ratingData.described,
      paid: ratingData.paid,
      note: ratingData.note,
    };

    const updatedClients = { ...clients };
    if (updatedClients[project.rid]) {
      updatedClients[project.rid] = {
        ...updatedClients[project.rid],
        ratings: [newRating, ...updatedClients[project.rid].ratings],
      };
      setClients(updatedClients);
    }

    const updatedApps = [...myApps];
    updatedApps[appIndex].rated = true;
    setMyApps(updatedApps);
    try {
      localStorage.setItem("brief_myapps", JSON.stringify(updatedApps));
    } catch (e) {}

    // Send to Supabase
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("ratings").insert({
          project_id: roleId,
          client_id: project.rid,
          overall: ratingData.overall,
          responded: String(ratingData.responded),
          described: String(ratingData.described),
          paid: String(ratingData.paid),
          note: ratingData.note,
        });
      } catch (err) {
        console.warn("Supabase rating insert note:", err);
      }
    }

    showToast("Rating submitted.");
    return true;
  };

  const moveApplicant = async (fromLane: string, index: number, toLane: string) => {
    const fromList = [...(applicantLanes[fromLane] || [])];
    const toList = [...(applicantLanes[toLane] || [])];
    const [item] = fromList.splice(index, 1);
    if (!item) return;
    toList.unshift(item);

    const laneNames: Record<string, string> = {
      new: "New",
      short: "Shortlisted",
      maybe: "Maybe",
      rej: "Rejected",
    };

    setApplicantLanes({
      ...applicantLanes,
      [fromLane]: fromList,
      [toLane]: toList,
    });

    showToast(`${item.n} → ${laneNames[toLane]}`);
  };

  const postProject = async (projectData: Omit<Project, "id">): Promise<number> => {
    let nextId = projects.length ? Math.max(...projects.map((p) => p.id)) + 1 : 1;

    const supabase = createClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("projects")
          .insert({
            title: projectData.project,
            role_title: projectData.role,
            category: projectData.format,
            city: projectData.city,
            description: projectData.desc,
            deadline: projectData.deadline,
            compensation_type: projectData.paid === "Unpaid" ? "Unpaid" : projectData.paid === "Hourly" ? "Hourly" : "Fixed price",
            compensation_details: projectData.comp,
            charges_freelancer_fee: false,
            required_tools: projectData.langs,
            additional_skills: projectData.skills,
            experience_required: projectData.gender,
            interview_mode: projectData.mode,
            status: "active",
          })
          .select("id")
          .single();

        if (!error && data?.id) {
          nextId = data.id;
        }
      } catch (err) {
        console.warn("Supabase project insert:", err);
      }
    }

    const newProject: Project = {
      ...projectData,
      id: nextId,
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    showToast("Project published.");
    return nextId;
  };

  const adminAction = async (
    index: number,
    queueType: "verif" | "reports",
    action: "approved" | "rejected" | "removed" | "dismissed"
  ) => {
    if (queueType === "verif") {
      const updated = [...verifQueue];
      const [item] = updated.splice(index, 1);
      setVerifQueue(updated);
      showToast(`${item?.org || item?.who || "Item"} ${action}.`);
    } else {
      const updated = [...reportsQueue];
      const [item] = updated.splice(index, 1);
      setReportsQueue(updated);
      showToast(`Report ${action}.`);
    }
  };

  const updateFreelancerProfile = async (profileData: Partial<Profile>) => {
    if (!session) return;
    const updatedSession = {
      ...session,
      profile: {
        ...(session.profile || {
          id: "f-self",
          role: "freelancer",
          name: session.name,
          city: "Mumbai",
          rate_range: "₹1,000–2,500/hr",
          skills: [],
          tools: [],
          experience_level: "New freelancer",
          verified_tier: "Identity verified" as const,
          verified_since: "2026",
          created_at: new Date().toISOString(),
        }),
        ...profileData,
      },
    };
    setSession(updatedSession);
    try {
      localStorage.setItem("brief_session", JSON.stringify(updatedSession));
    } catch (e) {}

    // Send profile upsert to Supabase
    const supabase = createClient();
    if (supabase) {
      try {
        const payload: Record<string, unknown> = {
          name: profileData.name || session.name,
          city: profileData.city || "Mumbai",
          rate_range: profileData.rate_range || "₹1,000–2,500/hr",
          tagline: profileData.tagline,
          portfolio_url: profileData.portfolio_url,
          tools: profileData.tools || [],
          skills: profileData.skills || [],
          experience_level: profileData.experience_level,
          role: "freelancer",
        };

        if (profileData.is_teacher) {
          payload.is_teacher = true;
          payload.subjects = profileData.subjects || [];
          payload.grades = profileData.grades || [];
          payload.boards = profileData.boards || [];
          payload.qualification = profileData.qualification || "";
          payload.teaching_mode = profileData.teaching_mode || "Online 1-on-1";
          payload.languages_spoken = profileData.languages_spoken || [];
          payload.demo_video_url = profileData.demo_video_url || "";
        }

        const { error: upsertErr } = await supabase.from("profiles").upsert(payload);
        if (upsertErr) {
          // If custom teacher columns aren't in schema yet, fallback to base payload
          console.warn("Supabase upsert warning, retrying with base fields:", upsertErr);
          await supabase.from("profiles").upsert({
            name: profileData.name || session.name,
            city: profileData.city || "Mumbai",
            rate_range: profileData.rate_range || "₹1,000–2,500/hr",
            tagline: profileData.tagline,
            portfolio_url: profileData.portfolio_url,
            tools: profileData.tools || [],
            skills: profileData.skills || [],
            experience_level: profileData.experience_level,
            role: "freelancer",
          });
        }
      } catch (err) {
        console.warn("Supabase profile upsert error:", err);
      }
    }

    showToast("Profile saved & synchronized.");
  };

  return (
    <MarketplaceContext.Provider
      value={{
        session,
        projects,
        clients,
        myApps,
        applicantLanes,
        verifQueue,
        reportsQueue,
        toasts,
        isLoading,
        loginAsDemo,
        signIn,
        signOut,
        showToast,
        aggregateRatings,
        hasApplied,
        submitApplication,
        submitRating,
        moveApplicant,
        postProject,
        adminAction,
        updateFreelancerProfile,
        refreshData,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
}
