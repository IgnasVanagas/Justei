import manifest from './media-manifest.json';
const media = (name) => manifest[name] ?? null;
export const heroImage = media('image.png');

export const locations = [
  {
    id: "1", title: "Pirmas pasimatymas", date: "2024-10-06", text: "Patikrinom kurio telefonas geresnis. Čia viskas prasidėjo.",
    coords: [54.686688, 25.297734], media: [media("IMG_20241006_191719.jpg")]
  },
  {
    id: "2", title: "Apsishoppinom", date: "2024-11-10", text: "Kieta panelė",
    coords: [54.7106853163931, 25.26491320950711], media: [media("IMG_20241110_151343.jpg")]
  },
  {
    id: "3", title: "Čia tapome pora", date: "2024-11-10", text: "Ir netoli buvo pirmas bučinys su burito skoniu.",
    coords: [54.679710, 25.293198], media: [media("IMG_20241121_170200.jpg")]
  },
  {
    id: "4", title: "Pirmas sleepovers ir pirmas bėgimas", date: "2024-12-01", text: "Kažką beveik suvalgė šuo.",
    coords: [54.924964, 23.952569], media: [media("Screenshot 2026-02-10 151917.png")]
  },
  {
    id: "5", title: "Trakai dar be mano mašinos raktelių", date: "2024-12-26", text: "Ir skanūs kibinai",
    coords: [54.651155, 24.933340], media: [media("Screenshot 2026-02-10 161000.png")]
  },
  {
    id: "6", title: "Žąsinas", date: "2024-12-28", text: "Chill guy",
    coords: [54.868832, 24.195923], media: [media("Screenshot 2026-02-10 152129.png")]
  },
  {
    id: "7", title: "Grindinam", date: "2024-12-31", text: "Plankas į naujus metus",
    coords: [55.691429360236086, 21.15076123423581], media: [media("IMG_20241231_123400.jpg")]
  },
  {
    id: "8", title: "Ant pasaulio krašto", date: "2025-02-12", text: "Kažkas atvarė į Portugaliją.",
    coords: [37.021754, -8.993677], media: [media("image00001 (4).jpeg")]
  },
  {
    id: "9", title: "Pirmoji Valentino diena", date: "2025-02-14", text: "O paskui buvo nuostabus vakaras valgant aštunkojį",
    coords: [37.179496, -7.441596], media: [media("Screenshot 2026-02-10 152720.png")]
  },
  {
    id: "10", title: "Pirmi dviračių testavimai", date: "2025-04-25", text: "Ir skanus maistas po jų",
    coords: [54.875624, 24.024847], media: [media("Screenshot 2026-02-10 153359.png")]
  },
  {
    id: "11", title: "Skaitiniai miške", date: "2025-05-11", text: "Ir gilūs pokalbiai",
    coords: [54.942468, 23.949067], media: [media("Screenshot 2026-02-10 153619.png")]
  },
  {
    id: "12", title: "Su tavim visur smagu", date: "2025-06-15", text: "Aplankėm mano kaimą, pravažiavom 130km ir Justytės alkūnės bučkis su asfaltu",
    coords: [54.948927, 24.388207], media: [media("Screenshot 2026-02-10 154113.png")]
  },
  {
    id: "13", title: "Po maudynių Jonavoj", date: "2025-06-23", text: "Gavom rimtesnes maudynes arčiau Kauno..",
    coords: [55.069509, 24.138476], media: [media("Screenshot 2026-02-10 154652.png")]
  },
  {
    id: "14", title: "Naujas butas", date: "2025-07-14", text: "...ir batai",
    coords: [54.898204, 23.970008], media: [media("20250714_161437.jpg")]
  },
  {
    id: "15", title: "Pirmas bikeback", date: "2025-07-26", text: "Ir pats smagiausias keliukas. Ir stirnos.",
    coords: [54.427003, 23.735224], media: [media("20250726_193830.jpg")]
  },
  {
    id: "16", title: "Maumedžiai", date: "2025-07-27", text: "Visi trys augam.",
    coords: [54.569200, 23.875185], media: [media("20250727_134421.jpg")]
  },
  {
    id: "17", title: "Kolekcionuojam ženklus", date: "2025-07-29", text: "Ir pabėgom nuo kareivių.",
    coords: [54.973407, 24.023830], 
    media: [media("20250729_212913.jpg"), media("20250729_195901.jpg"), media("20250729_195924.jpg"), media("20250729_212550.jpg")]
  },
  {
    id: "18", title: "Išsimaudėm", date: "2025-08-02", text: "Ir pasivažinėjom.",
    coords: [54.785268, 25.333282], 
    media: [media("20250802_174612.jpg"), media("20250802_174540.jpg"), media("20250802_174546.jpg")]
  },
  {
    id: "19", title: "Big day", date: "2025-08-05", text: "Mano Justytė baigė mokyklą",
    coords: [54.982513, 25.759599], 
    media: [media("Screenshot 2026-02-10 160116.png"), media("20250805_233850.jpg")]
  },
  {
    id: "20", title: "Moments before disaster", date: "2025-08-06", text: "Bet šiaip fun dienelė ir gražūs šuniukai kavinėje.",
    coords: [54.650151, 24.936471], 
    media: [media("20250806_190115.jpg"), media("20250806_185845.jpg")]
  },
  {
    id: "21", title: "Fotografai", date: "2025-08-17", text: "Ir fun piknikas prie Kauno marių.",
    coords: [54.875603, 24.020761], media: [media("DSCN0031.JPG")]
  },
  {
    id: "22", title: "Sleepy", date: "2025-08-23", text: "Kelionės pradžia",
    coords: [53.936435, 22.761293], media: [media("20250823_063123.jpg")]
  },
  {
    id: "23", title: "Laipiojam", date: "2025-08-24", text: "Pirma kelionė kartu",
    coords: [49.236502, 19.932209], 
    media: [media("DSCN0279.JPG"), media("DSCN0142.JPG"), media("DSCN0171.JPG"), media("DSCN0216.JPG"), media("DSCN0321.JPG"), media("20250824_132512.jpg")]
  },
  {
    id: "24", title: "Gražus ežeras", date: "2025-08-25", text: "Ir crazy dienelė su nuotykiais",
    coords: [49.200844, 20.072096], 
    media: [media("DSCN0376.JPG"), media("20250825_072110.jpg"), media("DSCN0439.JPG"), media("DSCN0440.JPG"), media("DSCN0466.JPG"), media("DSCN0510.JPG")]
  },
  {
    id: "25", title: "Įveikėm Rysy", date: "2025-08-28", text: "Suvalgėm brumika ir planavom lipti į Everestą",
    coords: [49.179557, 20.088054], 
    media: [media("DSCN0749.JPG"), media("DSCN0607.JPG"), media("DSCN0620.JPG"), media("20250828_175110.jpg"), media("20250830_092115.jpg")]
  },
  {
    id: "26", title: "Tinukas", date: "2025-11-01", text: "Ir paskui abu pavėmėm",
    coords: [54.991910, 25.792713], media: [media("20251101_211809.jpg")]
  },
  {
    id: "27", title: "Metai kartu", date: "2025-11-10", text: "Pirmi iš daugelio",
    coords: [54.939473, 23.894364], 
    media: [media("20251110_190312.mp4")], isVideo: true
  },
  {
    id: "28", title: "Bukapročiai", date: "2025-11-23", text: "Visom prasmėm",
    coords: [54.898212, 23.969954], media: [media("Screenshot_20251123_232759_Messenger.jpg")]
  },
  {
    id: "29", title: "Nauji metai", date: "2026-01-01", text: "Šį kartą be planko",
    coords: [54.869223, 23.977094], media: [media("20260101_010723.jpg")]
  },
  {
    id: "30", title: "Vintedo pirkiniai", date: "2026-01-16", text: "Ir smagūs vakarai kartu",
    coords: [54.898212, 23.969954], media: [media("20260116_170134.jpg")]
  },
  {
    id: "31", title: "Grybukas", date: "2026-01-31", text: "<3",
    coords: [55.000445, 25.787335], media: [media("20260131_155858.jpg")]
  },
  {
    id: "33", title: "Dviratininkai", date: "2026-04-18", text: "Ruošiamės tour de france",
    coords: [54.894961, 23.772922], media: [media("20260418_114757(0).jpg")]
  },
  {
    id: "34", title: "Pasipuošę", date: "2026-04-18", text: "Su savo meile",
    coords: [54.894933, 23.885392], media: [media("20260418_172048.jpg")]
  },
  {
    id: "35", title: "Naujas perukas", date: "2026-04-18", text: "Tik kakta išlindus",
    coords: [54.895744, 23.889511], media: [media("20260418_201905.jpg")]
  },
  {
    id: "36", title: "Žuviukai", date: "2026-04-21", text: "Reik grįžt į akvariumą",
    coords: [54.924886, 23.952761], media: [media("20260421_122708.jpg")]
  },
  {
    id: "37", title: "Alkana", date: "2026-04-28", text: "Tuoj mane suvalgys",
    coords: [54.898139, 23.970331], media: [media("20260428_160224.jpg")]
  },
  {
    id: "38", title: "Cirkas", date: "2026-05-23", text: "Du klounai",
    coords: [54.898167, 23.970431], media: [media("20260523_221009.jpg")]
  },
  {
    id: "39", title: "Pasivaikščiojimas", date: "2026-06-09", text: "Kartu leidžiam vasarą",
    coords: [54.891206, 23.967914], media: [media("20260609_165848.jpg")]
  },
  {
    id: "40", title: "Baigtas univeras", date: "2026-06-26", text: "Naujas etapas kartu",
    coords: [54.936072, 23.897517], media: [media("20260626_201450.jpg")]
  },
  {
    id: "41", title: "Rajoniniai", date: "2026-06-28", text: "Einam muštis",
    coords: [54.924936, 23.952536], media: [media("20260628_162412.jpg")]
  },
  {
    id: "42", title: "Palangoj", date: "2026-07-08", text: "Ruošiamės treniruotei",
    coords: [55.939442, 21.069433], media: [media("20260708_100620.jpg")]
  },
  {
    id: "43", title: "Prie jūros", date: "2026-07-09", text: "Degintis nepavyko",
    coords: [55.902136, 21.050956], media: [media("20260709_105013.jpg")]
  },
  {
    id: "44", title: "Skrendam", date: "2026-08-01", text: "Sleepy sleepy",
    coords: [50.58, 22.21], media: [media("20260801_064051.jpg")]
  },
  {
    id: "45", title: "Pusrytukai", date: "2026-08-01", text: "Tam agurkui šakės",
    coords: [43.64, 33.80], media: [media("20260801_083545.jpg")]
  },
  {
    id: "46", title: "Nuostabūs vaizdai", date: "2026-08-02", text: "Kurių nesimato",
    coords: [42.448422, 42.549064], media: [media("20260802_111631.jpg")]
  },
  {
    id: "47", title: "Plaukiam", date: "2026-08-02", text: "Šį kartą raktai liko",
    coords: [42.457153, 42.374589], media: [media("20260802_132406.jpg")]
  },
  {
    id: "48", title: "Prie upės", date: "2026-08-02", text: "<3",
    coords: [42.456333, 42.378422], media: [media("20260802_134411.jpg")]
  },
  {
    id: "49", title: "Urve", date: "2026-08-02", text: "Akys išpūstos",
    coords: [42.376478, 42.600483], media: [media("20260802_171154.jpg")]
  },
  {
    id: "50", title: "Pradedam lipti", date: "2026-08-06", text: "Bet kelio neradom",
    coords: [43.047983, 42.752411], media: [media("20260806_100038.jpg")]
  },
  {
    id: "51", title: "Meilė tarp kalnų", date: "2026-08-06", text: "Su tavim visur gera",
    coords: [43.062933, 42.775553], media: [media("20260806_110542.jpg")]
  },
  {
    id: "52", title: "Džiaugiamės kalnais", date: "2026-08-07", text: "Naujas aukščio rekordas abiem",
    coords: [43.086592, 42.706269], media: [media("20260807_100120.jpg")]
  },
  {
    id: "53", title: "Rainbow kalnai", date: "2026-08-11", text: "O Ignas čia mašinų pardavinėt atvarė",
    coords: [41.447706, 45.375778], media: [media("20260811_125628.jpg")]
  },
];
