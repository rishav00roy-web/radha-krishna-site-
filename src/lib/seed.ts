/**
 * Default content shown when Supabase is not configured, and mirrored by
 * supabase/migrations/0002_seed.sql. Every facility is "proposed" and every
 * milestone is "planned" and unverified: the brief forbids claiming progress
 * that has not been verified.
 */
import type {
  Facility, GalleryItem, Milestone, Organisation, LocationInfo, SiteMedia, GalleryCategory,
} from "./types";
import type { Localized } from "@/i18n/config";

const L = (en: string, as: string, hi: string): Localized => ({ en, as, hi });

export const seedFacilities: Facility[] = [
  {
    id: "f-a", code: "A", slug: "main-temple", icon: "temple", status: "proposed", pos_x: 50, pos_y: 46, image_url: null, sort: 1,
    name: L("Main Radha-Krishna Temple", "মূল ৰাধা-কৃষ্ণ মন্দিৰ", "मुख्य राधा-कृष्ण मंदिर"),
    summary: L("The spiritual and architectural centre of the campus.", "চৌহদৰ আধ্যাত্মিক আৰু স্থাপত্যৰ কেন্দ্ৰ।", "परिसर का आध्यात्मिक और स्थापत्य केंद्र।"),
    description: L(
      "A white-marble temple with a rising shikhara, mandap and sanctum for the Radha-Krishna deities. Every other part of the campus is planned around it.",
      "ওখ শিখৰ, মণ্ডপ আৰু ৰাধা-কৃষ্ণ বিগ্ৰহৰ গৰ্ভগৃহসহ বগা মাৰ্বলৰ মন্দিৰ। চৌহদৰ আন সকলো অংশ ইয়াক কেন্দ্ৰ কৰি পৰিকল্পনা কৰা হৈছে।",
      "ऊँचे शिखर, मंडप और राधा-कृष्ण विग्रहों के गर्भगृह वाला श्वेत संगमरमर का मंदिर। परिसर का हर दूसरा भाग इसी के चारों ओर नियोजित है।",
    ),
  },
  {
    id: "f-b", code: "B", slug: "gaushala", icon: "cow", status: "proposed", pos_x: 18, pos_y: 24, image_url: null, sort: 2,
    name: L("Gaushala", "গোশালা", "गौशाला"),
    summary: L("A dedicated space for cow care, protection and gau seva.", "গৰুৰ যত্ন, সুৰক্ষা আৰু গো-সেৱাৰ বাবে নিৰ্দিষ্ট স্থান।", "गायों की देखभाल, संरक्षण और गौ सेवा के लिए समर्पित स्थान।"),
    description: L(
      "Shelter, fodder and veterinary care for cows, with space for visitors to take part in gau seva.",
      "গৰুৰ বাবে আশ্ৰয়, খাদ্য আৰু পশু চিকিৎসা, লগতে অতিথিসকলে গো-সেৱাত অংশ ল'ব পৰা স্থান।",
      "गायों के लिए आश्रय, चारा और पशु चिकित्सा, साथ ही आगंतुकों के लिए गौ सेवा में भाग लेने का स्थान।",
    ),
  },
  {
    id: "f-c", code: "C", slug: "amrit-sarovar", icon: "water", status: "proposed", pos_x: 27, pos_y: 70, image_url: null, sort: 3,
    name: L("Amrit Sarovar", "অমৃত সৰোবৰ", "अमृत सरोवर"),
    summary: L("A proposed water body for water conservation and aquatic biodiversity.", "পানী সংৰক্ষণ আৰু জলজ জৈৱ বৈচিত্ৰ্যৰ বাবে প্ৰস্তাৱিত জলাশয়।", "जल संरक्षण और जलीय जैव विविधता के लिए प्रस्तावित जलाशय।"),
    description: L(
      "A pond to harvest rainwater and recharge groundwater, planted with lotus and native aquatic species.",
      "বৰষুণৰ পানী সংৰক্ষণ আৰু ভূগৰ্ভস্থ পানী পূৰণৰ বাবে পুখুৰী, য'ত পদুম আৰু থলুৱা জলজ উদ্ভিদ থাকিব।",
      "वर्षा जल संचयन और भूजल पुनर्भरण के लिए तालाब, जिसमें कमल और देशी जलीय पौधे होंगे।",
    ),
  },
  {
    id: "f-d", code: "D", slug: "bamboo-garden", icon: "bamboo", status: "proposed", pos_x: 86, pos_y: 50, image_url: null, sort: 4,
    name: L("Bamboo Garden", "বাঁহ বাগিচা", "बाँस उद्यान"),
    summary: L("A bamboo landscape showcasing Assam's natural heritage.", "অসমৰ প্ৰাকৃতিক ঐতিহ্য প্ৰদৰ্শন কৰা বাঁহনি।", "असम की प्राकृतिक विरासत दर्शाता बाँस परिदृश्य।"),
    description: L(
      "Groves of bamboo species found in Assam, with shaded walks and pavilions in traditional bamboo craft.",
      "অসমত পোৱা বাঁহৰ প্ৰজাতিৰ বাঁহনি, ছাঁযুক্ত খোজকঢ়া পথ আৰু পৰম্পৰাগত বাঁহ শিল্পৰ চ'ৰা।",
      "असम में पाई जाने वाली बाँस प्रजातियों के झुरमुट, छायादार पथ और पारंपरिक बाँस शिल्प के मंडप।",
    ),
  },
  {
    id: "f-e", code: "E", slug: "medicinal-garden", icon: "herb", status: "proposed", pos_x: 38, pos_y: 20, image_url: null, sort: 5,
    name: L("Medicinal Plant Garden", "ঔষধি উদ্ভিদ বাগিচা", "औषधीय पौध उद्यान"),
    summary: L("A garden of medicinal and aromatic plants.", "ঔষধি আৰু সুগন্ধি উদ্ভিদৰ বাগিচা।", "औषधीय और सुगंधित पौधों का उद्यान।"),
    description: L(
      "Labelled beds of medicinal and aromatic plants for learning, including tulsi for temple worship.",
      "শিকাৰ বাবে নামফলকযুক্ত ঔষধি আৰু সুগন্ধি উদ্ভিদৰ দাৰি, মন্দিৰৰ পূজাৰ বাবে তুলসীকে ধৰি।",
      "सीखने के लिए नामपट्ट वाली औषधीय और सुगंधित पौधों की क्यारियाँ, मंदिर पूजा के लिए तुलसी सहित।",
    ),
  },
  {
    id: "f-f", code: "F", slug: "fruit-forest", icon: "fruit", status: "proposed", pos_x: 12, pos_y: 54, image_url: null, sort: 6,
    name: L("Fruit Forest", "ফল অৰণ্য", "फल वन"),
    summary: L("A green landscape of fruit-bearing trees.", "ফলৱতী গছৰ এক সেউজ পৰিৱেশ।", "फलदार पेड़ों का हरा-भरा परिदृश्य।"),
    description: L(
      "A layered grove of fruit trees planted like a natural forest, offering shade and seasonal fruit.",
      "প্ৰাকৃতিক অৰণ্যৰ দৰে স্তৰে স্তৰে ৰোপণ কৰা ফলৰ গছৰ বাগিচা, যিয়ে ছাঁ আৰু ঋতুভিত্তিক ফল দিব।",
      "प्राकृतिक वन की तरह परतों में लगाया गया फल वृक्षों का उपवन, जो छाया और मौसमी फल देगा।",
    ),
  },
  {
    id: "f-g", code: "G", slug: "meditation-centre", icon: "meditate", status: "proposed", pos_x: 74, pos_y: 22, image_url: null, sort: 7,
    name: L("Meditation Centre", "ধ্যান কেন্দ্ৰ", "ध्यान केंद्र"),
    summary: L("A peaceful space for meditation, yoga and spiritual practice.", "ধ্যান, যোগ আৰু আধ্যাত্মিক সাধনাৰ বাবে শান্ত স্থান।", "ध्यान, योग और आध्यात्मिक साधना के लिए शांत स्थान।"),
    description: L(
      "A quiet hall and open-air decks set apart from the busier areas, for meditation, yoga and retreats.",
      "ব্যস্ত অংশৰ পৰা আঁতৰত ধ্যান, যোগ আৰু সাধনা শিবিৰৰ বাবে এক শান্ত গৃহ আৰু মুকলি মঞ্চ।",
      "व्यस्त क्षेत्रों से अलग, ध्यान, योग और साधना शिविरों के लिए एक शांत कक्ष और खुले मंच।",
    ),
  },
  {
    id: "f-h", code: "H", slug: "cultural-space", icon: "gathering", status: "proposed", pos_x: 72, pos_y: 74, image_url: null, sort: 8,
    name: L("Cultural and Religious Activity Space", "সাংস্কৃতিক আৰু ধৰ্মীয় কাৰ্যক্ষেত্ৰ", "सांस्कृतिक और धार्मिक गतिविधि स्थल"),
    summary: L("For gatherings, Bhagavata path, discourses and celebrations.", "সমাৱেশ, ভাগৱত পাঠ, প্ৰৱচন আৰু উৎসৱৰ বাবে।", "सभाओं, भागवत पाठ, प्रवचन और उत्सवों के लिए।"),
    description: L(
      "An open ground and covered hall for festivals such as Rasa Mahotsav, Bhagavata path and spiritual discourses.",
      "ৰাস মহোৎসৱ, ভাগৱত পাঠ আৰু আধ্যাত্মিক প্ৰৱচনৰ দৰে উৎসৱৰ বাবে মুকলি পথাৰ আৰু ঢাকনিযুক্ত সভাগৃহ।",
      "रास महोत्सव, भागवत पाठ और आध्यात्मिक प्रवचन जैसे उत्सवों के लिए खुला मैदान और ढका हुआ सभागार।",
    ),
  },
];

const stage = (step: number, title: Localized, description: Localized): Milestone => ({
  id: `m-${step}`, step, title, description, status: "planned", verified: false, verified_on: null,
});

export const seedMilestones: Milestone[] = [
  stage(1, L("Project conceptualisation", "প্ৰকল্পৰ ধাৰণা গঠন", "परियोजना की परिकल्पना"),
    L("Defining the vision, purpose and scope of the temple campus.", "মন্দিৰ চৌহদৰ দৃষ্টিভংগী, উদ্দেশ্য আৰু পৰিসৰ নিৰ্ধাৰণ।", "मंदिर परिसर की परिकल्पना, उद्देश्य और दायरे का निर्धारण।")),
  stage(2, L("Land identification and planning", "মাটি চিনাক্তকৰণ আৰু পৰিকল্পনা", "भूमि की पहचान और योजना"),
    L("Identifying a suitable site and preparing an initial plan.", "উপযুক্ত স্থান চিনাক্ত কৰা আৰু প্ৰাৰম্ভিক পৰিকল্পনা প্ৰস্তুত কৰা।", "उपयुक्त स्थल की पहचान और प्रारंभिक योजना तैयार करना।")),
  stage(3, L("Architectural design", "স্থাপত্য ডিজাইন", "स्थापत्य डिज़ाइन"),
    L("Preparing temple and campus designs with architects.", "স্থপতিৰ সৈতে মন্দিৰ আৰু চৌহদৰ ডিজাইন প্ৰস্তুত কৰা।", "वास्तुकारों के साथ मंदिर और परिसर के डिज़ाइन तैयार करना।")),
  stage(4, L("Statutory permissions", "বৈধানিক অনুমতি", "वैधानिक अनुमतियाँ"),
    L("Applying for the approvals required by law before any construction.", "নিৰ্মাণৰ আগতে আইনগতভাৱে প্ৰয়োজনীয় অনুমোদনৰ বাবে আবেদন কৰা।", "किसी भी निर्माण से पहले कानूनन आवश्यक अनुमतियों के लिए आवेदन।")),
  stage(5, L("Campus development", "চৌহদ উন্নয়ন", "परिसर विकास"),
    L("Site preparation, access roads, water and power.", "স্থান প্ৰস্তুতি, প্ৰৱেশ পথ, পানী আৰু বিদ্যুৎ।", "स्थल की तैयारी, पहुँच मार्ग, जल और बिजली।")),
  stage(6, L("Temple construction", "মন্দিৰ নিৰ্মাণ", "मंदिर निर्माण"),
    L("Building the main Radha-Krishna temple.", "মূল ৰাধা-কৃষ্ণ মন্দিৰ নিৰ্মাণ।", "मुख्य राधा-कृष्ण मंदिर का निर्माण।")),
  stage(7, L("Landscaping and facilities", "প্ৰাকৃতিক সজ্জা আৰু সুবিধা", "भू-दृश्य और सुविधाएँ"),
    L("Gardens, gaushala, sarovar and other campus facilities.", "বাগিচা, গোশালা, সৰোবৰ আৰু চৌহদৰ আন সুবিধা।", "उद्यान, गौशाला, सरोवर और परिसर की अन्य सुविधाएँ।")),
  stage(8, L("Spiritual programmes begin", "আধ্যাত্মিক কাৰ্যসূচী আৰম্ভ", "आध्यात्मिक कार्यक्रमों का आरंभ"),
    L("Regular worship, festivals and programmes at the temple.", "মন্দিৰত নিয়মীয়া পূজা, উৎসৱ আৰু কাৰ্যসূচী।", "मंदिर में नियमित पूजा, उत्सव और कार्यक्रम।")),
];

const ph = (id: string, category: GalleryCategory, title: Localized, sort: number): GalleryItem => ({
  id, category, title, caption: L("", "", ""), media_type: "image", url: null, thumbnail_url: null, is_placeholder: true, sort,
});

export const seedGallery: GalleryItem[] = [
  ph("g-1", "architecture", L("Temple front elevation", "মন্দিৰৰ সন্মুখৰ দৃশ্য", "मंदिर का सामने का दृश्य"), 1),
  ph("g-2", "architecture", L("Mandap and prayer hall", "মণ্ডপ আৰু প্ৰাৰ্থনা গৃহ", "मंडप और प्रार्थना कक्ष"), 2),
  ph("g-3", "architecture", L("Entrance gateway", "প্ৰৱেশ তোৰণ", "प्रवेश द्वार"), 3),
  ph("g-4", "architecture", L("Temple at dusk", "গোধূলিত মন্দিৰ", "संध्या में मंदिर"), 4),
  ph("g-5", "art", L("Radha-Krishna devotional art", "ৰাধা-কৃষ্ণ ভক্তিমূলক কলা", "राधा-कृष्ण भक्ति कला"), 5),
  ph("g-6", "masterplan", L("Campus master plan", "চৌহদৰ মাষ্টাৰ প্লেন", "परिसर मास्टर प्लान"), 6),
  ph("g-7", "sarovar", L("Amrit Sarovar concept", "অমৃত সৰোবৰৰ ধাৰণা", "अमृत सरोवर परिकल्पना"), 7),
  ph("g-8", "gaushala", L("Gaushala concept", "গোশালাৰ ধাৰণা", "गौशाला परिकल्पना"), 8),
  ph("g-9", "bamboo", L("Bamboo garden concept", "বাঁহ বাগিচাৰ ধাৰণা", "बाँस उद्यान परिकल्पना"), 9),
  ph("g-10", "medicinal", L("Medicinal garden concept", "ঔষধি বাগিচাৰ ধাৰণা", "औषधीय उद्यान परिकल्पना"), 10),
  ph("g-11", "fruit", L("Fruit forest concept", "ফল অৰণ্যৰ ধাৰণা", "फल वन परिकल्पना"), 11),
];

export const seedOrganisation: Organisation = {
  name: "Gousamuh Gramaya Foundation",
  short_name: "GGF",
  legal_form: "A Section 8 Company incorporated under the Companies Act, 2013.",
  cin: "U72200AS2025NPL027736",
  pan: "AALCG8370M",
  csr: "CSR00091344",
  darpan: "AS/2025/0586563",
  address: "Horucharai Ali, Pulibor, P.O. Probotia, Jorhat – 785006, Assam, India",
  phone: "9864522165",
  email: null,
  leader_name: "Polash Jyoti Bora",
  leader_title: "Chief Executive Officer",
};

// No coordinates, directions or landmarks until they are verified.
export const seedLocation: LocationInfo = { lat: null, lng: null, directions: null, landmarks: [] };

export const seedMedia: SiteMedia = { hero_image: null, masterplan_image: null, logo: null };
