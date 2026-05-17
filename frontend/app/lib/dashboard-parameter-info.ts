export type ParamCopy = {
  ruLabel: string;
  etLabel: string;
  enLabel: string;
  ruDesc: string;
  etDesc: string;
  enDesc: string;
};

export const PARAM_INFO: Record<string, ParamCopy> = {
  e_coli: {
    ruLabel: "E. coli (КОЕ/100 мл)", etLabel: "E. coli (PMÜ/100 ml)", enLabel: "E. coli (CFU/100 ml)",
    ruDesc: "Ключевой индикатор фекального загрязнения. Повышенные значения увеличивают риск кишечных инфекций и контактных заболеваний, особенно в открытой воде.",
    etDesc: "Fekaalreostuse põhiindikaator. Kõrged väärtused suurendavad seedetrakti infektsioonide ja kontakthaiguste riski, eriti avatud vees.",
    enDesc: "Key indicator of faecal contamination. Elevated values increase risk of intestinal infections and contact diseases, especially in open water.",
  },
  enterococci: {
    ruLabel: "Энтерококки (КОЕ/100 мл)", etLabel: "Enterokokid (PMÜ/100 ml)", enLabel: "Enterococci (CFU/100 ml)",
    ruDesc: "Бактериальный индикатор для купальных зон и рекреационной воды. В сочетании с E. coli помогает оценить микробиологическую безопасность.",
    etDesc: "Bakteriaalne veekvaliteedi indikaator, eriti supluskohtades. Koos E. coliga aitab hinnata mikrobioloogilist ohutust.",
    enDesc: "Bacterial indicator for bathing and recreational water. Together with E. coli it helps assess microbiological safety.",
  },
  coliforms: {
    ruLabel: "Колиформы (КОЕ/100 мл)", etLabel: "Kolibakterid (PMÜ/100 ml)", enLabel: "Coliforms (CFU/100 ml)",
    ruDesc: "Общий микробиологический индикатор санитарного состояния. Рост колиформ может указывать на проблемы в источнике или системе водоподготовки.",
    etDesc: "Üldine mikrobioloogiline näitaja vee sanitaarseisundi kohta. Kõrge tase viitab allikas- või töötlemisprobleemidele.",
    enDesc: "General microbiological indicator of sanitary conditions. Elevated coliforms may indicate issues in the water source or treatment system.",
  },
  ph: {
    ruLabel: "pH", etLabel: "pH", enLabel: "pH",
    ruDesc: "Кислотность/щёлочность воды. Влияет на коррозию труб, эффективность дезинфекции и комфорт при контакте с водой. Норма для питьевой воды: 6.5–9.5.",
    etDesc: "Vee happelisus/leelisus. Mõjutab torutorrosiooni, desinfektsiooni tõhusust ja mugavust. Joogivee norm: 6.5–9.5.",
    enDesc: "Acidity/alkalinity of water. Affects pipe corrosion, disinfection efficiency and comfort. Drinking water norm: 6.5–9.5.",
  },
  nitrates: {
    ruLabel: "Нитраты (мг/л)", etLabel: "Nitraadid (mg/l)", enLabel: "Nitrates (mg/L)",
    ruDesc: "Особенно важны для питьевой воды. Повышенные нитраты часто связаны с сельхоз-стоками и требуют усиленного контроля. Норма: ≤50 мг/л.",
    etDesc: "Eriti olulised joogivees. Kõrge tase on sageli seotud põllumajanduslike heitvetega. Norm: ≤50 mg/l.",
    enDesc: "Particularly important for drinking water. Elevated nitrates are often linked to agricultural run-off. Norm: ≤50 mg/L.",
  },
  nitrites: {
    ruLabel: "Нитриты (мг/л)", etLabel: "Nitritid (mg/l)", enLabel: "Nitrites (mg/L)",
    ruDesc: "Маркер свежей биозагрязнённости и нестабильных процессов азотного цикла. В питьевой воде требует повышенного внимания. Норма: ≤0.5 мг/л.",
    etDesc: "Värske bioreostuse marker. Joogivees nõuab erilist tähelepanu. Norm: ≤0.5 mg/l.",
    enDesc: "Marker of fresh biological contamination and unstable nitrogen-cycle processes. Requires close attention in drinking water. Norm: ≤0.5 mg/L.",
  },
  ammonium: {
    ruLabel: "Аммоний (мг/л)", etLabel: "Ammoonium (mg/l)", enLabel: "Ammonium (mg/L)",
    ruDesc: "Повышенный аммоний может указывать на органическое загрязнение или недостаточную очистку. Влияет на вкус/запах воды. Норма: ≤0.5 мг/л.",
    etDesc: "Kõrgenenud ammoonium võib viidata orgaanilisele reostusele. Mõjutab vee maitset ja lõhna. Norm: ≤0.5 mg/l.",
    enDesc: "Elevated ammonium may indicate organic contamination or insufficient treatment. Affects taste and odour. Norm: ≤0.5 mg/L.",
  },
  turbidity: {
    ruLabel: "Мутность (NTU)", etLabel: "Hägusus (NTU)", enLabel: "Turbidity (NTU)",
    ruDesc: "Отражает количество взвешенных частиц. Повышенные значения могут маскировать микробные риски и снижать эффективность дезинфекции. Норма: ≤4 NTU (питьевая), ≤0.5 NTU (бассейн).",
    etDesc: "Peegeldab hõljuvate osakeste hulka. Kõrge hägusus varjab mikroobiohtu ja vähendab desinfektsiooni tõhusust.",
    enDesc: "Reflects suspended particles. Elevated turbidity can mask microbial risks and reduce disinfection effectiveness. Norm: ≤4 NTU (drinking), ≤0.5 NTU (pool).",
  },
  free_chlorine: {
    ruLabel: "Свободный хлор (мг/л)", etLabel: "Vaba kloor (mg/l)", enLabel: "Free chlorine (mg/L)",
    ruDesc: "Ключевой параметр для бассейнов/SPA: недостаток снижает дезинфекцию, избыток может раздражать кожу, глаза и дыхательные пути. Норма: 0.5–1.5 мг/л.",
    etDesc: "Basseinides/SPA-des kriitiliselt oluline: liiga vähe vähendab desinfektsiooni, liiga palju ärritab. Norm: 0.5–1.5 mg/l.",
    enDesc: "Critical for pools/SPA: too little reduces disinfection; excess irritates skin, eyes and airways. Norm: 0.5–1.5 mg/L.",
  },
  combined_chlorine: {
    ruLabel: "Связанный хлор (мг/л)", etLabel: "Seotud kloor (mg/l)", enLabel: "Combined chlorine (mg/L)",
    ruDesc: "Хлорамины, образующиеся в бассейнах при реакции хлора с аммиаком из пота и мочи. Высокие значения дают запах «хлорки» и раздражение слизистых. Норма: ≤0.5 мг/л.",
    etDesc: "Basseinis tekkivad kloramiinid. Kõrged väärtused põhjustavad lõhna ja limaskesta ärritust. Norm: ≤0.5 mg/l.",
    enDesc: "Chloramines in pools from chlorine reacting with ammonia in sweat/urine. Cause the 'pool smell' and mucosal irritation. Norm: ≤0.5 mg/L.",
  },
  iron: {
    ruLabel: "Железо (мг/л)", etLabel: "Raud (mg/l)", enLabel: "Iron (mg/L)",
    ruDesc: "Повышенное железо придаёт воде металлический привкус и ржавый оттенок, окрашивает сантехнику. Связано со старением труб или природными грунтовыми водами. Норма: ≤0.2 мг/л.",
    etDesc: "Kõrge rauasisaldus annab veele metalse maitse ja roostelise värvi. Seotud vananenud torude või põhjavee omapäraga. Norm: ≤0.2 mg/l.",
    enDesc: "Elevated iron gives a metallic taste and rusty tint, staining plumbing. Linked to ageing pipes or natural groundwater. Norm: ≤0.2 mg/L.",
  },
  manganese: {
    ruLabel: "Марганец (мг/л)", etLabel: "Mangaan (mg/l)", enLabel: "Manganese (mg/L)",
    ruDesc: "Придаёт воде тёмную окраску и металлический вкус. Хроническое воздействие высоких доз может влиять на нервную систему. Норма: ≤0.05 мг/л.",
    etDesc: "Annab veele tumeda värvuse ja metalse maitse. Pikaaegne kõrge tase võib mõjutada närvisüsteemi. Norm: ≤0.05 mg/l.",
    enDesc: "Gives water a dark tint and metallic taste. Chronic exposure to high levels may affect the nervous system. Norm: ≤0.05 mg/L.",
  },
  fluoride: {
    ruLabel: "Фторид (мг/л)", etLabel: "Fluoriid (mg/l)", enLabel: "Fluoride (mg/L)",
    ruDesc: "В небольших количествах защищает зубы от кариеса, но при избытке вызывает флюороз зубов и костей. Норма ЕС для питьевой воды: ≤1.5 мг/л.",
    etDesc: "Väikestes kogustes kaitseb hambaid, kuid ülemäärasus põhjustab fluoroosi. EL joogivee norm: ≤1.5 mg/l.",
    enDesc: "In small amounts protects teeth from decay, but excess causes dental and skeletal fluorosis. EU drinking water norm: ≤1.5 mg/L.",
  },
  color: {
    ruLabel: "Цветность (мг Pt/л)", etLabel: "Värvus (mg Pt/l)", enLabel: "Colour (mg Pt/L)",
    ruDesc: "Измеряется по платиново-кобальтовой шкале. Высокая цветность обычно связана с гуминовыми веществами из торфяных почв — не токсично само по себе, но указывает на органику. Норма: ≤20 мг Pt/л.",
    etDesc: "Mõõdetakse plaatina-koobalt skaalal. Kõrge värvus viitab humiinainetele turbapinnasest. Norm: ≤20 mg Pt/l.",
    enDesc: "Measured on the platinum-cobalt scale. High colour typically indicates humic substances from peat soils — not directly toxic but signals organic matter. Norm: ≤20 mg Pt/L.",
  },
  chlorides: {
    ruLabel: "Хлориды (мг/л)", etLabel: "Kloriidid (mg/l)", enLabel: "Chlorides (mg/L)",
    ruDesc: "Повышенные хлориды могут указывать на засоление, влияние морской воды, противогололёдные реагенты или промышленные стоки. Влияют на вкус воды и коррозию. Норма: ≤250 мг/л.",
    etDesc: "Kõrge kloriidide sisaldus viitab soolastumisele, merevee mõjule või tööstusheitmetele. Norm: ≤250 mg/l.",
    enDesc: "Elevated chlorides may indicate salinisation, seawater intrusion, de-icing agents or industrial discharge. Affect taste and pipe corrosion. Norm: ≤250 mg/L.",
  },
  sulfates: {
    ruLabel: "Сульфаты (мг/л)", etLabel: "Sulfaadid (mg/l)", enLabel: "Sulfates (mg/L)",
    ruDesc: "Высокое содержание сульфатов может оказывать слабительный эффект при длительном употреблении. Влияют на вкус воды. Норма: ≤250 мг/л.",
    etDesc: "Kõrge sulfaadisisaldus võib pikaajalise tarbimise korral põhjustada lahtistit. Mõjutab vee maitset. Norm: ≤250 mg/l.",
    enDesc: "High sulfate content may have a laxative effect with prolonged consumption and affects taste. Norm: ≤250 mg/L.",
  },
  pseudomonas: {
    ruLabel: "Pseudomonas aeruginosa (КОЕ/100 мл)", etLabel: "Pseudomonas aeruginosa (PMÜ/100 ml)", enLabel: "Pseudomonas aeruginosa (CFU/100 ml)",
    ruDesc: "Условно-патогенный микроорганизм. В бассейнах норма — 0 КОЕ/100 мл. Может вызывать инфекции кожи, глаз и ушей, особенно у иммунокомпрометированных лиц.",
    etDesc: "Oportunistlik patogeen. Basseinides norm: 0 PMÜ/100 ml. Võib põhjustada naha-, silma- ja kõrvainfektsioone.",
    enDesc: "Opportunistic pathogen; must be absent in pool water (0 CFU/100 ml). Can cause skin, eye and ear infections, especially in immunocompromised individuals.",
  },
  staphylococci: {
    ruLabel: "Staphylococcus aureus (КОЕ/100 мл)", etLabel: "Staphylococcus aureus (PMÜ/100 ml)", enLabel: "Staphylococcus aureus (CFU/100 ml)",
    ruDesc: "Патогенная бактерия. В бассейнах норма ≤20 КОЕ/100 мл. Превышение указывает на антисанитарию и возможное заражение кожи и слизистых оболочек.",
    etDesc: "Patogeenne bakter. Basseinides norm ≤20 PMÜ/100 ml. Ületamine viitab sanitaarprobleemidele.",
    enDesc: "Pathogenic bacterium. Pool norm: ≤20 CFU/100 ml. Exceedance indicates unsanitary conditions and risk of skin/mucous membrane infections.",
  },
  transparency: {
    ruLabel: "Прозрачность (м)", etLabel: "Läbipaistvus (m)", enLabel: "Transparency (m)",
    ruDesc: "Видимая глубина воды по шкале Секки в метрах. Используется для купальных зон. Снижение прозрачности указывает на цветение водорослей, взвесь или загрязнение.",
    etDesc: "Sekchi sügavus meetrites. Kasutatakse supluskohtades. Läbipaistvuse vähenemine viitab vetikate õitsengule või reostusele.",
    enDesc: "Secchi depth in metres. Used for bathing areas. Decreasing transparency indicates algal blooms, suspended matter or other contamination.",
  },
  oxidizability: {
    ruLabel: "Окисляемость (мг O₂/л)", etLabel: "Oksüdeeritavus (mg O₂/l)", enLabel: "Oxidisability (mg O₂/L)",
    ruDesc: "Интегральный показатель содержания легкоокисляемых органических веществ (перманганатная окисляемость). Повышенные значения говорят о большей органической нагрузке и риске образования побочных продуктов хлорирования.",
    etDesc: "Integraalne näitaja kergesti oksüdeeruvate orgaaniliste ainete sisalduse kohta. Kõrged väärtused viitavad suuremale orgaanilisele koormusele ja kloorimise kõrvalsaaduste tekkeohule.",
    enDesc: "Integrated measure of easily oxidisable organic matter (permanganate oxidisability). Higher values mean greater organic load and a higher risk of chlorination by-products.",
  },
  colonies_37c: {
    ruLabel: "Колонии при 37 °C (КОЕ/мл)", etLabel: "Kolooniad 37 °C juures (PMÜ/ml)", enLabel: "Colonies at 37 °C (CFU/mL)",
    ruDesc: "Общее микробное число при температуре тела — суммарная бактериальная нагрузка. Резкий рост указывает на сбой дезинфекции или формирование биоплёнки в системе; сам по себе не указывает на конкретный патоген.",
    etDesc: "Üldine mikroobide arv kehatemperatuuril — bakterite üldhulk. Järsk tõus viitab desinfektsiooni häirele või biokile tekkele; ei näita konkreetset patogeeni.",
    enDesc: "Heterotrophic plate count at body temperature — total bacterial load. A sharp rise indicates failing disinfection or biofilm growth; it does not point at a specific pathogen.",
  },
};
