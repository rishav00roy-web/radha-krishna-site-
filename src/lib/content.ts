/**
 * All site content lives here. Edit this file and redeploy to change it.
 *
 * Honesty rules from the brief: every facility stays "proposed" and every
 * milestone stays "planned" and unverified until the foundation has verified
 * otherwise. Photos are illustrative stock images from Unsplash, not of this
 * temple, and are captioned and credited as such on the site.
 */
import type {
  Announcement, EventItem, Facility, GalleryItem, Milestone, Organisation, LocationInfo, Photo, ProjectUpdate, GalleryCategory,
} from "./types";
import type { Localized } from "@/i18n/config";

const L = (en: string, as: string, hi: string): Localized => ({ en, as, hi });

const credit = (name: string, username: string) => ({ name, username });

/** Illustrative Unsplash photos (https://unsplash.com/license). */
export const photos = {
  radhaKrishnaStatues: { id: "photo-1660280037297-a3b5e79a3d20", credit: credit("Aditya Lonkar", "thelonkar"), alt: L("Statues of Radha and Krishna", "ৰাধা আৰু কৃষ্ণৰ মূৰ্তি", "राधा और कृष्ण की मूर्तियाँ") },
  radhaKrishnaRelief: { id: "photo-1771575522385-03403deadd16", credit: credit("Adhitya Sibikumar", "adhitya_2505"), alt: L("Carved relief of Radha and Krishna on a swing", "দোলনাত ৰাধা-কৃষ্ণৰ খোদিত ভাস্কৰ্য", "झूले पर राधा-कृष्ण की नक्काशीदार आकृति") },
  flutePlayer: { id: "photo-1641730259879-ad98e7db7bcb", credit: credit("Paragg Girish Gaikwad", "throughmylens_parag"), alt: L("Bronze figure of Krishna playing the flute", "বাঁহী বজোৱা কৃষ্ণৰ পিতলৰ মূৰ্তি", "बाँसुरी बजाते कृष्ण की कांस्य प्रतिमा") },
  peacockFeather: { id: "photo-1625580916836-1badf2c15b32", credit: credit("Sandip Karangiya", "mr_karangia"), alt: L("A peacock feather", "ময়ূৰৰ পাখি", "मोरपंख") },
  carvedPillars: { id: "photo-1768560348752-5fcbe2c4f5f4", credit: credit("Suhas Hanjar", "suhashanjar"), alt: L("Carved stone temple pillars", "খোদিত শিলৰ মন্দিৰ-স্তম্ভ", "नक्काशीदार पत्थर के मंदिर स्तंभ") },
  pillaredHall: { id: "photo-1768560346779-0fd1d162c68e", credit: credit("Suhas Hanjar", "suhashanjar"), alt: L("A pillared temple hall", "স্তম্ভযুক্ত মন্দিৰৰ সভাগৃহ", "स्तंभों वाला मंदिर मंडप") },
  whiteMarble: { id: "photo-1766592954327-4805e19eae38", credit: credit("Nancy Verma", "vnancy"), alt: L("White marble temple detail against the sky", "আকাশৰ পটভূমিত বগা মাৰ্বলৰ মন্দিৰৰ অংশ", "आकाश की पृष्ठभूमि में श्वेत संगमरमर मंदिर का भाग") },
  carvedFigures: { id: "photo-1672215060701-c4207cbdc430", credit: credit("Deepak Gupta", "authordeepakgupta"), alt: L("Carved figures on a temple wall", "মন্দিৰৰ বেৰত খোদিত মূৰ্তি", "मंदिर की दीवार पर उकेरी गई आकृतियाँ") },
  diyas: { id: "photo-1783255166190-bee5e9e1294d", credit: credit("Thilina Alagiyawanna", "thilinaalagiyawanna"), alt: L("Rows of lit oil lamps", "জ্বলি থকা চাকিৰ শাৰী", "जलते दीयों की पंक्तियाँ") },
  diyaPlatter: { id: "photo-1760630004439-18b3bbd826be", credit: credit("Alessandro Sacchi", "alle_sacchi"), alt: L("Lit diyas on a platter", "থালত জ্বলি থকা চাকি", "थाली में जलते दीये") },
  aarti: { id: "photo-1724433320825-51dd5f9c6bc4", credit: credit("Akshat Jhingran", "akshat_jhingran"), alt: L("An aarti plate with flames", "জ্বলন্ত শিখাৰ আৰতিৰ থাল", "जलती लौ वाली आरती की थाली") },
  lotus: { id: "photo-1604191049452-9f608997e57e", credit: credit("ravinepz", "ravinepz"), alt: L("A pink lotus on still water", "শান্ত পানীত গুলপীয়া পদুম", "शांत जल पर गुलाबी कमल") },
  lotusPond: { id: "photo-1510839154674-905169657821", credit: credit("sorasagano", "sorasagano"), alt: L("Lily pads on calm water", "শান্ত পানীত পদুমৰ পাত", "शांत जल पर कमल के पत्ते") },
  cow: { id: "photo-1669543994478-13e5cbfffab4", credit: credit("Amol Jadhav", "amoljadhav"), alt: L("A cow resting in a green field", "সেউজ পথাৰত জিৰণি লোৱা গৰু", "हरे खेत में आराम करती गाय") },
  cowSky: { id: "photo-1595664652035-0956d50e0311", credit: credit("Anand Thakur", "oversorted"), alt: L("A brown cow under a blue sky", "নীলা আকাশৰ তলত মুগা ৰঙৰ গৰু", "नीले आकाश के नीचे भूरी गाय") },
  bambooPath: { id: "photo-1772196118210-3e982cf79c1e", credit: credit("Tobias Reich", "electerious"), alt: L("A stone path through a bamboo grove", "বাঁহনিৰ মাজেৰে শিলৰ পথ", "बाँस के झुरमुट से होकर पत्थर का रास्ता") },
  bamboo: { id: "photo-1586061968253-7bf5724aab7b", credit: credit("Clement Souchet", "windclems"), alt: L("Tall green bamboo", "ওখ সেউজ বাঁহ", "ऊँचे हरे बाँस") },
  tulsi: { id: "photo-1664289283342-7dfd936b4b99", credit: credit("Punyashree Venkatram", "aphrodite_13"), alt: L("A tulsi plant", "তুলসী গছ", "तुलसी का पौधा") },
  mangoes: { id: "photo-1788371844806-6dbff0696caa", credit: credit("Natasha Reddy", "natashareddy"), alt: L("Green mangoes on a tree", "গছত কেঁচা আম", "पेड़ पर कच्चे आम") },
  fruitTree: { id: "photo-1622955658214-d05c1c6fcf84", credit: credit("Rajendra Biswal", "rpbiswal"), alt: L("Yellow fruit hanging on a tree", "গছত ওলমি থকা হালধীয়া ফল", "पेड़ पर लटके पीले फल") },
  tree: { id: "photo-1502082553048-f009c37129b9", credit: credit("niko photos", "niko_photos"), alt: L("A broad green tree", "বহল সেউজ গছ", "फैला हुआ हरा पेड़") },
  greenField: { id: "photo-1624702331407-fddcb819d904", credit: credit("Narayan Adhikary", "narayan7"), alt: L("A green field under open sky", "মুকলি আকাশৰ তলত সেউজ পথাৰ", "खुले आकाश के नीचे हरा खेत") },
  meditation: { id: "photo-1731171060382-0ed37122ad60", credit: credit("Gokul Gurung", "infinitygraphy"), alt: L("A person meditating by a river", "নদীৰ পাৰত ধ্যানমগ্ন এজন ব্যক্তি", "नदी किनारे ध्यान करता व्यक्ति") },
  kirtan: { id: "photo-1568219656418-15c329312bf1", credit: credit("Ricky Singh", "rickysinghy"), alt: L("Close-up of a musical instrument", "বাদ্যযন্ত্ৰৰ ওচৰৰ দৃশ্য", "वाद्य यंत्र का नज़दीकी दृश्य") },
} satisfies Record<string, Photo>;
export type PhotoKey = keyof typeof photos;

/** Illustrative Unsplash photos for the eight journey stages, in order. Not of this project. */
export const journeyPhotos: Photo[] = [
  { id: "photo-1763575648374-4aa2da800fac", credit: credit("Kwami Fattah Al Sissi", "kwami_heude_50"), alt: L("Hands sketching a design in a notebook", "নোটবুকত ডিজাইন আঁকি থকা হাত", "नोटबुक में डिज़ाइन का रेखाचित्र बनाते हाथ") },
  { id: "photo-1624702331407-fddcb819d904", credit: credit("Narayan Adhikary", "narayan7"), alt: L("Green land under a cloudy sky in Assam", "অসমত ডাৱৰীয়া আকাশৰ তলত সেউজ মাটি", "असम में बादलों भरे आकाश के नीचे हरी भूमि") },
  { id: "photo-1781888688940-5730c3fd5baf", credit: credit("Jonathan Borba", "jonathanborba"), alt: L("Architectural drawings on a desk", "মেজত স্থাপত্যৰ নক্সা", "मेज़ पर स्थापत्य नक्शे") },
  { id: "photo-1763729805496-b5dbf7f00c79", credit: credit("Jakub Żerdzicki", "jakubzerdzicki"), alt: L("A hand signing a document", "নথিত চহী কৰি থকা হাত", "दस्तावेज़ पर हस्ताक्षर करता हाथ") },
  { id: "photo-1746003870948-d48c87d8d694", credit: credit("Fahri Maulana", "fahrimaul"), alt: L("Workers on a construction site", "নিৰ্মাণস্থলীত শ্ৰমিক", "निर्माण स्थल पर कामगार") },
  { id: "photo-1766937545904-8cabd8e6c7a9", credit: credit("Suhas Hanjar", "suhashanjar"), alt: L("A carved stone temple pillar", "খোদিত শিলৰ মন্দিৰ-স্তম্ভ", "नक्काशीदार पत्थर का मंदिर स्तंभ") },
  { id: "photo-1542601906990-b4d3fb778b09", credit: credit("Noah Buscher", "noahbuscher"), alt: L("Hands holding a seedling in soil", "মাটিত পুলি ধৰি থকা হাত", "मिट्टी में पौधा थामे हाथ") },
  { id: "photo-1764173517657-0e7d94d94a4b", credit: credit("Pratyush Mishra", "devpratyush"), alt: L("An evening aarti with lamps", "চাকিৰে সন্ধিয়াৰ আৰতি", "दीपों के साथ संध्या आरती") },
];

export const facilities: Facility[] = [
  {
    id: "f-a", code: "A", slug: "main-temple", icon: "temple", status: "proposed", pos_x: 50, pos_y: 46, photo: photos.whiteMarble, sort: 1,
    name: L("Main Radha-Krishna Temple", "মূল ৰাধা-কৃষ্ণ মন্দিৰ", "मुख्य राधा-कृष्ण मंदिर"),
    summary: L("The spiritual and architectural centre of the campus.", "চৌহদৰ আধ্যাত্মিক আৰু স্থাপত্যৰ কেন্দ্ৰ।", "परिसर का आध्यात्मिक और स्थापत्य केंद्र।"),
    description: L(
      "A white-marble temple with a rising shikhara, mandap and sanctum for the Radha-Krishna deities. Every other part of the campus is planned around it.",
      "ওখ শিখৰ, মণ্ডপ আৰু ৰাধা-কৃষ্ণ বিগ্ৰহৰ গৰ্ভগৃহসহ বগা মাৰ্বলৰ মন্দিৰ। চৌহদৰ আন সকলো অংশ ইয়াক কেন্দ্ৰ কৰি পৰিকল্পনা কৰা হৈছে।",
      "ऊँचे शिखर, मंडप और राधा-कृष्ण विग्रहों के गर्भगृह वाला श्वेत संगमरमर का मंदिर। परिसर का हर दूसरा भाग इसी के चारों ओर नियोजित है।",
    ),
  },
  {
    id: "f-b", code: "B", slug: "gaushala", icon: "cow", status: "proposed", pos_x: 18, pos_y: 24, photo: photos.cow, sort: 2,
    name: L("Gaushala", "গোশালা", "गौशाला"),
    summary: L("A dedicated space for cow care, protection and gau seva.", "গৰুৰ যত্ন, সুৰক্ষা আৰু গো-সেৱাৰ বাবে নিৰ্দিষ্ট স্থান।", "गायों की देखभाल, संरक्षण और गौ सेवा के लिए समर्पित स्थान।"),
    description: L(
      "Shelter, fodder and veterinary care for cows, with space for visitors to take part in gau seva.",
      "গৰুৰ বাবে আশ্ৰয়, খাদ্য আৰু পশু চিকিৎসা, লগতে অতিথিসকলে গো-সেৱাত অংশ ল'ব পৰা স্থান।",
      "गायों के लिए आश्रय, चारा और पशु चिकित्सा, साथ ही आगंतुकों के लिए गौ सेवा में भाग लेने का स्थान।",
    ),
  },
  {
    id: "f-c", code: "C", slug: "amrit-sarovar", icon: "water", status: "proposed", pos_x: 27, pos_y: 70, photo: photos.lotus, sort: 3,
    name: L("Amrit Sarovar", "অমৃত সৰোবৰ", "अमृत सरोवर"),
    summary: L("A proposed water body for water conservation and aquatic biodiversity.", "পানী সংৰক্ষণ আৰু জলজ জৈৱ বৈচিত্ৰ্যৰ বাবে প্ৰস্তাৱিত জলাশয়।", "जल संरक्षण और जलीय जैव विविधता के लिए प्रस्तावित जलाशय।"),
    description: L(
      "A pond to harvest rainwater and recharge groundwater, planted with lotus and native aquatic species.",
      "বৰষুণৰ পানী সংৰক্ষণ আৰু ভূগৰ্ভস্থ পানী পূৰণৰ বাবে পুখুৰী, য'ত পদুম আৰু থলুৱা জলজ উদ্ভিদ থাকিব।",
      "वर्षा जल संचयन और भूजल पुनर्भरण के लिए तालाब, जिसमें कमल और देशी जलीय पौधे होंगे।",
    ),
  },
  {
    id: "f-d", code: "D", slug: "bamboo-garden", icon: "bamboo", status: "proposed", pos_x: 86, pos_y: 50, photo: photos.bambooPath, sort: 4,
    name: L("Bamboo Garden", "বাঁহ বাগিচা", "बाँस उद्यान"),
    summary: L("A bamboo landscape showcasing Assam's natural heritage.", "অসমৰ প্ৰাকৃতিক ঐতিহ্য প্ৰদৰ্শন কৰা বাঁহনি।", "असम की प्राकृतिक विरासत दर्शाता बाँस परिदृश्य।"),
    description: L(
      "Groves of bamboo species found in Assam, with shaded walks and pavilions in traditional bamboo craft.",
      "অসমত পোৱা বাঁহৰ প্ৰজাতিৰ বাঁহনি, ছাঁযুক্ত খোজকঢ়া পথ আৰু পৰম্পৰাগত বাঁহ শিল্পৰ চ'ৰা।",
      "असम में पाई जाने वाली बाँस प्रजातियों के झुरमुट, छायादार पथ और पारंपरिक बाँस शिल्प के मंडप।",
    ),
  },
  {
    id: "f-e", code: "E", slug: "medicinal-garden", icon: "herb", status: "proposed", pos_x: 38, pos_y: 20, photo: photos.tulsi, sort: 5,
    name: L("Medicinal Plant Garden", "ঔষধি উদ্ভিদ বাগিচা", "औषधीय पौध उद्यान"),
    summary: L("A garden of medicinal and aromatic plants.", "ঔষধি আৰু সুগন্ধি উদ্ভিদৰ বাগিচা।", "औषधीय और सुगंधित पौधों का उद्यान।"),
    description: L(
      "Labelled beds of medicinal and aromatic plants for learning, including tulsi for temple worship.",
      "শিকাৰ বাবে নামফলকযুক্ত ঔষধি আৰু সুগন্ধি উদ্ভিদৰ দাৰি, মন্দিৰৰ পূজাৰ বাবে তুলসীকে ধৰি।",
      "सीखने के लिए नामपट्ट वाली औषधीय और सुगंधित पौधों की क्यारियाँ, मंदिर पूजा के लिए तुलसी सहित।",
    ),
  },
  {
    id: "f-f", code: "F", slug: "fruit-forest", icon: "fruit", status: "proposed", pos_x: 12, pos_y: 54, photo: photos.mangoes, sort: 6,
    name: L("Fruit Forest", "ফল অৰণ্য", "फल वन"),
    summary: L("A green landscape of fruit-bearing trees.", "ফলৱতী গছৰ এক সেউজ পৰিৱেশ।", "फलदार पेड़ों का हरा-भरा परिदृश्य।"),
    description: L(
      "A layered grove of fruit trees planted like a natural forest, offering shade and seasonal fruit.",
      "প্ৰাকৃতিক অৰণ্যৰ দৰে স্তৰে স্তৰে ৰোপণ কৰা ফলৰ গছৰ বাগিচা, যিয়ে ছাঁ আৰু ঋতুভিত্তিক ফল দিব।",
      "प्राकृतिक वन की तरह परतों में लगाया गया फल वृक्षों का उपवन, जो छाया और मौसमी फल देगा।",
    ),
  },
  {
    id: "f-g", code: "G", slug: "meditation-centre", icon: "meditate", status: "proposed", pos_x: 74, pos_y: 22, photo: photos.meditation, sort: 7,
    name: L("Meditation Centre", "ধ্যান কেন্দ্ৰ", "ध्यान केंद्र"),
    summary: L("A peaceful space for meditation, yoga and spiritual practice.", "ধ্যান, যোগ আৰু আধ্যাত্মিক সাধনাৰ বাবে শান্ত স্থান।", "ध्यान, योग और आध्यात्मिक साधना के लिए शांत स्थान।"),
    description: L(
      "A quiet hall and open-air decks set apart from the busier areas, for meditation, yoga and retreats.",
      "ব্যস্ত অংশৰ পৰা আঁতৰত ধ্যান, যোগ আৰু সাধনা শিবিৰৰ বাবে এক শান্ত গৃহ আৰু মুকলি মঞ্চ।",
      "व्यस्त क्षेत्रों से अलग, ध्यान, योग और साधना शिविरों के लिए एक शांत कक्ष और खुले मंच।",
    ),
  },
  {
    id: "f-h", code: "H", slug: "cultural-space", icon: "gathering", status: "proposed", pos_x: 72, pos_y: 74, photo: photos.diyas, sort: 8,
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

export const milestones: Milestone[] = [
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

const g = (id: string, category: GalleryCategory, photo: Photo, sort: number): GalleryItem => ({
  id, category, title: photo.alt, caption: L("", "", ""), media_type: "image", photo, url: null, sort,
});

export const gallery: GalleryItem[] = [
  g("g-1", "architecture", photos.whiteMarble, 1),
  g("g-2", "architecture", photos.carvedPillars, 2),
  g("g-3", "architecture", photos.pillaredHall, 3),
  g("g-4", "architecture", photos.carvedFigures, 4),
  g("g-5", "art", photos.radhaKrishnaStatues, 5),
  g("g-6", "art", photos.radhaKrishnaRelief, 6),
  g("g-7", "art", photos.flutePlayer, 7),
  g("g-8", "art", photos.peacockFeather, 8),
  g("g-9", "worship", photos.aarti, 9),
  g("g-10", "worship", photos.diyas, 10),
  g("g-11", "worship", photos.diyaPlatter, 11),
  g("g-12", "sarovar", photos.lotus, 12),
  g("g-13", "sarovar", photos.lotusPond, 13),
  g("g-14", "gaushala", photos.cow, 14),
  g("g-15", "gaushala", photos.cowSky, 15),
  g("g-16", "bamboo", photos.bambooPath, 16),
  g("g-17", "bamboo", photos.bamboo, 17),
  g("g-18", "medicinal", photos.tulsi, 18),
  g("g-19", "fruit", photos.mangoes, 19),
  g("g-20", "fruit", photos.fruitTree, 20),
];

export const organisation: Organisation = {
  name: "Gousamuh Gramaya Foundation",
  short_name: "GGF",
  legal_form: "A Section 8 Company incorporated under the Companies Act, 2013.",
  cin: "U72200AS2025NPL027736",
  pan: "AALCG8370M",
  csr: "CSR00091344",
  darpan: "AS/2025/0586563",
  address: "Horucharai Ali, Pulibor, P.O. Probotia, Jorhat – 785006, Assam, India",
  phone: "9864522165",
  // PLACEHOLDER: replace with the foundation's real address. Contact and donation forms send to it.
  email: "info@example.org",
  whatsapp: "919864522165",
  leader_name: "Polash Jyoti Bora",
  leader_title: "Chief Executive Officer",
  // The foundation's donation account, from its cheque leaf (shared by Rishav on 2026-11-25).
  bank: {
    account_name: "Gousamuh Gramaya Foundation",
    bank: "Bank of Maharashtra",
    account: "60527976497",
    ifsc: "MAHB0001566",
    branch: "Jorhat (branch code 01566), Assam 785006",
  },
};

// Events and announcements: add entries here when dates are confirmed.
// Example: { id: "e-1", title: L("…", "…", "…"), description: L("", "", ""), starts_at: "2027-08-15T18:00:00+05:30", ends_at: null, venue: null }
export const events: EventItem[] = [];
export const announcements: Announcement[] = [];
// Project updates appear on the journey page. Only publish verified progress.
export const updates: ProjectUpdate[] = [];

// No coordinates, directions or landmarks until they are verified.
export const location: LocationInfo = { lat: null, lng: null, directions: null, landmarks: [] };

