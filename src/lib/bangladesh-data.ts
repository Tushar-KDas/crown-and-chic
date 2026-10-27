export interface DivisionData {
  name: string;
  districts: {
    name: string;
    thanas: string[];
  }[];
}

export const BANGLADESH_DIVISIONS: DivisionData[] = [
  {
    name: "Dhaka",
    districts: [
      {
        name: "Dhaka Metro",
        thanas: [
          "Dhanmondi", "Gulshan", "Banani", "Uttara", "Mirpur", "Mohammadpur", 
          "Badda", "Tejgaon", "Khilgaon", "Motijheel", "Paltan", "Shahbagh", 
          "Lalbagh", "New Market", "Hazaribagh", "Rampura", "Bashundhara R/A", 
          "Malibagh", "Moghbazar", "Jatrabari", "Demra", "Pallabi"
        ]
      },
      {
        name: "Dhaka District",
        thanas: ["Savar", "Dhamrai", "Keraniganj", "Nawabganj", "Dohar"]
      },
      {
        name: "Gazipur",
        thanas: ["Gazipur Sadar", "Kaliakair", "Kapasia", "Sreepur", "Kaliganj", "Tongi"]
      },
      {
        name: "Narayanganj",
        thanas: ["Narayanganj Sadar", "Bandar", "Rupganj", "Sonargaon", "Araihazar", "Fatullah", "Siddhirganj"]
      },
      {
        name: "Tangail",
        thanas: ["Tangail Sadar", "Mirzapur", "Delduar", "Nagarpur", "Ghatail", "Madhupur", "Sakhipur", "Kalihati"]
      },
      {
        name: "Faridpur",
        thanas: ["Faridpur Sadar", "Boalmari", "Alfadanga", "Madhukhali", "Bhanga", "Nagarkanda", "Charbhadrasan", "Sadarpur"]
      },
      {
        name: "Manikganj",
        thanas: ["Manikganj Sadar", "Singair", "Saturia", "Shivalaya", "Harirampur", "Ghior", "Daulatpur"]
      },
      {
        name: "Munshiganj",
        thanas: ["Munshiganj Sadar", "Sreenagar", "Sirajdikhan", "Louhajang", "Tongibari", "Gajaria"]
      },
      {
        name: "Narsingdi",
        thanas: ["Narsingdi Sadar", "Palash", "Belabo", "Monohardi", "Shibpur", "Raipura"]
      },
      {
        name: "Gopalganj",
        thanas: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"]
      },
      {
        name: "Madaripur",
        thanas: ["Madaripur Sadar", "Shibchar", "Kalkini", "Rajoir"]
      },
      {
        name: "Rajbari",
        thanas: ["Rajbari Sadar", "Goalanda", "Pangsha", "Baliakandi", "Kalukhali"]
      },
      {
        name: "Shariatpur",
        thanas: ["Shariatpur Sadar", "Damudya", "Naria", "Janjira", "Bhedarganj", "Gosairhat"]
      }
    ]
  },
  {
    name: "Chattogram",
    districts: [
      {
        name: "Chattogram Metro",
        thanas: ["Kotwali", "Panchlaish", "Double Mooring", "Khulshi", "Halishahar", "Bakalia", "Bayazid", "Chandgaon", "Pahartali", "Patenga", "Agrabad", "Nasirabad"]
      },
      {
        name: "Chattogram District",
        thanas: ["Sitakunda", "Mirsharai", "Hathazari", "Raozan", "Rangunia", "Patiya", "Boalkhali", "Anwara", "Chandanaish", "Satkania", "Lohagara", "Banshkhali"]
      },
      {
        name: "Cox's Bazar",
        thanas: ["Cox's Bazar Sadar", "Chakaria", "Maheshkhali", "Teknaf", "Ukhia", "Ramu", "Pekua", "Kutubdia"]
      },
      {
        name: "Cumilla",
        thanas: ["Cumilla Adarsha Sadar", "Cumilla Sadar Dakshin", "Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Muradnagar", "Nangalkot", "Titas"]
      },
      {
        name: "Feni",
        thanas: ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Fulgazi", "Sonagazi"]
      },
      {
        name: "Brahmanbaria",
        thanas: ["Brahmanbaria Sadar", "Ashuganj", "Nasirnagar", "Nabinagar", "Sarail", "Kasba", "Akhaura", "Bancharampur", "Bijoynagar"]
      },
      {
        name: "Noakhali",
        thanas: ["Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Senbagh", "Sonaimuri", "Subarnachar", "Kabirhat"]
      },
      {
        name: "Chandpur",
        thanas: ["Chandpur Sadar", "Faridganj", "Haimchar", "Haziganj", "Kachua", "Matlab Dakshin", "Matlab Uttar", "Shahrasti"]
      },
      {
        name: "Lakshmipur",
        thanas: ["Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati", "Kamalnagar"]
      }
    ]
  },
  {
    name: "Sylhet",
    districts: [
      {
        name: "Sylhet",
        thanas: ["Sylhet Sadar", "Beanibazar", "Golapganj", "Companiganj", "Fenchuganj", "Bishwanath", "Balaganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Zakiganj", "Dakshin Surma", "Osmani Nagar"]
      },
      {
        name: "Moulvibazar",
        thanas: ["Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal"]
      },
      {
        name: "Habiganj",
        thanas: ["Habiganj Sadar", "Bahubal", "Baniachang", "Chunarughat", "Ajmiriganj", "Madhabpur", "Nabiganj", "Lakhai", "Sayestaganj"]
      },
      {
        name: "Sunamganj",
        thanas: ["Sunamganj Sadar", "South Sunamganj", "Bishwamvarpur", "Chhatak", "Derai", "Dharampasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Tahirpur", "Sullah"]
      }
    ]
  },
  {
    name: "Rajshahi",
    districts: [
      {
        name: "Rajshahi",
        thanas: ["Boalia", "Rajpara", "Motihar", "Shah Makhdum", "Paba", "Godagari", "Tanore", "Bagmara", "Durgapur", "Puthia", "Charghat", "Bagha"]
      },
      {
        name: "Bogura",
        thanas: ["Bogura Sadar", "Adamdighi", "Dhunat", "Dhupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatala"]
      },
      {
        name: "Pabna",
        thanas: ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Santhia", "Sujanagar"]
      },
      {
        name: "Sirajganj",
        thanas: ["Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Rayganj", "Shahjadpur", "Tarash", "Ullapara"]
      },
      {
        name: "Naogaon",
        thanas: ["Naogaon Sadar", "Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Mahadevpurt", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"]
      },
      {
        name: "Natore",
        thanas: ["Natore Sadar", "Baraigram", "Gurudaspur", "Lalpur", "Singra", "Bagatipara", "Naldanga"]
      }
    ]
  },
  {
    name: "Khulna",
    districts: [
      {
        name: "Khulna",
        thanas: ["Khulna Sadar", "Sonadanga", "Khalishpur", "Daulatpur", "Khan Jahan Ali", "Batiaghata", "Dacope", "Dumuria", "Dighalia", "Koyra", "Paikgachha", "Phultala", "Rupsha", "Terokhada"]
      },
      {
        name: "Jashore",
        thanas: ["Jashore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"]
      },
      {
        name: "Kushtia",
        thanas: ["Kushtia Sadar", "Kumarkhali", "Khoksa", "Mirpur", "Bheramara", "Daulatpur"]
      }
    ]
  },
  {
    name: "Barishal",
    districts: [
      {
        name: "Barishal",
        thanas: ["Kotwali", "Airport", "Kawnia", "Bakerganj", "Babuganj", "Banaripara", "Gournadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur"]
      },
      {
        name: "Patuakhali",
        thanas: ["Patuakhali Sadar", "Bauphal", "Dashmina", "Galachipa", "Kalapara", "Mirzaganj", "Rangabali", "Dumki"]
      }
    ]
  },
  {
    name: "Rangpur",
    districts: [
      {
        name: "Rangpur",
        thanas: ["Kotwali", "Tajhat", "Haragach", "Parbotipur", "Badarganj", "Gangachhara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"]
      },
      {
        name: "Dinajpur",
        thanas: ["Dinajpur Sadar", "Birganj", "Birampur", "Bochaganj", "Fulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"]
      }
    ]
  },
  {
    name: "Mymensingh",
    districts: [
      {
        name: "Mymensingh",
        thanas: ["Kotwali", "Bhaluka", "Trishal", "Haluaghat", "Muktagachha", "Dhobaura", "Fulbaria", "Gaffargaon", "Gauripur", "Ishwarganj", "Nandail", "Phulpur", "Tara Khanda"]
      },
      {
        name: "Jamalpur",
        thanas: ["Jamalpur Sadar", "Baksiganj", "Dewanganj", "Islampur", "Madarganj", "Melandaha", "Sarishabari"]
      }
    ]
  }
];

export function getShippingCharge(division: string, subtotal: number, freeShippingThreshold = 2500): number {
  if (subtotal >= freeShippingThreshold) {
    return 0;
  }
  // Standard Bangladesh rates: Inside Dhaka = 60 BDT, Outside Dhaka = 120 BDT
  if (division.toLowerCase() === "dhaka") {
    return 60;
  }
  return 120;
}
