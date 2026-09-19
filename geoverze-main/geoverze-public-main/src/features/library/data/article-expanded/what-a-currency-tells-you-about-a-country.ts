import type { ArticleBlock } from "@/features/library/data/articles";
import { editorialClosing } from "@/features/library/lib/article-content-utils";

export const BLOCKS: readonly ArticleBlock[] = [
  {
    kind: "paragraph",
    text: "Before you learn a country's history, look at its banknotes. The imagery a government chooses to print on money is a deliberate act of national self-description — decided by committees, debated by parliaments, and occasionally revised after political upheavals. The faces, landscapes, monuments, and symbols that appear on currency tell you what a state wants to celebrate, who it considers a national hero, and, by omission, whose history it prefers not to circulate. A new leader on a banknote can signal a revolution. A removed face can signal one too. Few objects pass through more hands — literally — than a country's currency, making it the most widely distributed piece of official state communication in existence.",
  },

  { kind: "heading", id: "what-currencies-communicate", text: "What currencies communicate" },
  {
    kind: "paragraph",
    text: "Currency design is a form of soft power in daily circulation. Most countries depict founding leaders, national monuments, endemic wildlife, or iconic landscapes. These choices reveal the government's preferred national narrative. North Korea's won features Kim Il-sung and scenes of industrial production, projecting socialist achievement. The Swiss franc depicts cultural figures and landscapes rather than political leaders, reflecting Switzerland's tradition of consensual, de-personalised governance. India's rupee shows Gandhi — the only face — and the national emblem, but its reverse imagery rotates across the country's regional diversity: agriculture, science, and infrastructure. Who is left out matters too. For most of the modern dollar's history, only white founding fathers have appeared on US paper currency, a pattern that generated significant pressure for reform in the 2010s.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "The face on a banknote is a political choice. The US dollar has depicted exclusively men since its modern design era. The UK shows its living monarch, updated with each accession — Charles III appeared on new notes from 2023. Several countries have deliberately moved away from political leaders entirely, replacing them with scientists, artists, or natural landscapes as a statement about national values rather than state power.",
  },
  {
    kind: "image",
    art: "article-currency-banknotes-world",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Banknotes_of_various_currencies.jpg/1280px-Banknotes_of_various_currencies.jpg",
    caption: "A selection of world currency banknotes — each one a statement of national identity, political history, and economic aspiration.",
    credit: "Wikimedia Commons / Public Domain",
  },

  { kind: "heading", id: "dollar-dominance", text: "The dollar and its global dominance" },
  {
    kind: "paragraph",
    text: "The US dollar became the world's dominant reserve currency through the Bretton Woods Agreement of 1944, signed in New Hampshire by 44 Allied nations. The agreement fixed all currencies to the dollar, and the dollar to gold at $35 per troy ounce, creating a stable post-war monetary order that allowed global trade to recover. After the US unilaterally ended dollar-gold convertibility in August 1971 — the 'Nixon Shock' — the system became one of floating exchange rates anchored to dollar credibility rather than gold. The petrodollar system reinforced dominance: when OPEC began pricing oil exclusively in US dollars in the early 1970s, every oil-importing nation needed dollar reserves to buy energy, creating structural global demand for the currency regardless of US economic conditions. Today, approximately 88% of all foreign exchange transactions involve the US dollar on one side of the trade.",
  },
  {
    kind: "timeline",
    title: "From gold standard to digital currencies",
    events: [
      { date: "1871–1914", text: "Classical gold standard: major currencies fixed to gold, enabling stable international trade across the British Empire." },
      { date: "1944", text: "Bretton Woods Agreement: dollar pegged to gold at $35/oz; all other currencies pegged to dollar. IMF and World Bank created." },
      { date: "1971", text: "Nixon Shock: US ends dollar-gold convertibility unilaterally. Bretton Woods effectively collapses." },
      { date: "1973–74", text: "OPEC oil shock; petrodollar system formalised — oil priced globally in USD, cementing dollar reserve status." },
      { date: "1999", text: "Euro launched as accounting currency for 11 nations, replacing franc, mark, lira, peseta, escudo, and others." },
      { date: "2002", text: "Euro banknotes and coins enter circulation; fictional architectural imagery unveiled to avoid national disputes." },
      { date: "2008–09", text: "Global financial crisis; dollar strengthens as safe-haven currency despite the US being the epicentre." },
      { date: "2020", text: "Bahamas launches Sand Dollar — world's first fully deployed central bank digital currency (CBDC)." },
      { date: "2021", text: "El Salvador makes Bitcoin legal tender — first country in history to do so. China's e-CNY trials expand." },
      { date: "2023", text: "BRICS nations discuss creating a common currency or settlement mechanism to reduce dollar dependence." },
    ],
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "88% of all forex transactions in 2022 involved the US dollar on at least one side. The euro was second at 31%. The Japanese yen third at 17%. Total daily forex trading volume: approximately $7.5 trillion — larger than the annual GDP of every country except the United States and China.",
  },
  {
    kind: "image",
    art: "article-bretton-woods-conference",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Bretton_Woods_Conference%2C_1944.jpg/1280px-Bretton_Woods_Conference%2C_1944.jpg",
    caption: "The Bretton Woods Conference, July 1944 — 44 nations established the post-war international monetary order that gave the US dollar its global primacy.",
    credit: "Wikimedia Commons / Public Domain",
  },

  { kind: "heading", id: "de-dollarization", text: "De-dollarization: why it is so hard to dislodge the dollar" },
  {
    kind: "paragraph",
    text: "BRICS nations — Brazil, Russia, India, China, and South Africa, later joined by additional members — have periodically discussed creating a common currency or settling bilateral trade in national currencies to reduce dollar exposure. The difficulty is that the dollar's dominance is self-reinforcing: oil is priced in dollars, most commodity contracts are in dollars, the deepest and most liquid government bond market in the world is US Treasuries, and the SWIFT financial messaging system routes through dollar-clearing infrastructure. A country wishing to reduce dollar exposure must simultaneously find trading partners willing to accept alternatives, develop liquid alternative bond markets, and persuade commodity sellers to reprice. Russia's exclusion from SWIFT following its 2022 invasion of Ukraine demonstrated both the power of dollar infrastructure as a sanction mechanism and the urgency others feel about building alternatives.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "China's CIPS (Cross-border Interbank Payment System) handles yuan-denominated transactions and saw significant use increases after 2022. However, CIPS processes roughly 1% of SWIFT's daily transaction volume. The yuan accounts for approximately 2.5% of global foreign exchange reserves — compared to 59% for the US dollar — despite China being the world's second-largest economy.",
  },

  { kind: "heading", id: "euro-fictional-architecture", text: "The euro: fictional architecture and real compromises" },
  {
    kind: "paragraph",
    text: "The euro banknotes, introduced in 2002, depict windows, gateways, and bridges — but none of them are real. They represent architectural styles from different periods of European history: Classical, Romanesque, Gothic, Renaissance, Baroque, Art Nouveau, and Modern. The choice of fictional buildings was a deliberate political compromise: when twelve nations were negotiating design, every actual building or bridge suggested by one country was objected to by another. Paris objected to German monuments. Germany objected to French ones. The compromise — fictional but plausible European architecture — is a remarkable document of political necessity rendered in everyday objects. The coins, however, do show real national imagery: each country mints its own design on the coin's reverse, producing a eurozone where the same denomination looks different depending on where it was minted.",
  },
  {
    kind: "image",
    art: "article-euro-banknotes-series",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Euro_banknotes_2013.jpg/1280px-Euro_banknotes_2013.jpg",
    caption: "Euro banknotes depict fictional European architectural styles — a compromise that prevented endless disputes about whose real buildings should appear on a shared currency.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "Sweden held a referendum on the euro in 2003 and voted No by 55.9% to 42.0%. Sweden remains legally required to adopt the euro as an EU member but has deliberately maintained an exchange rate mechanism that prevents eurozone entry — a legalistic work-around. Denmark negotiated a formal opt-out in the 1992 Maastricht Treaty. The UK's opt-out was used for its entire EU membership until Brexit removed the question.",
  },

  { kind: "heading", id: "hyperinflation", text: "Hyperinflation: when currency becomes worthless" },
  {
    kind: "paragraph",
    text: "Hyperinflation — technically defined as inflation exceeding 50% per month — is one of the most destructive economic events a country can experience, and the currency is both its symptom and its record. Weimar Germany (1921–1923) is the most famous case: at the peak, the exchange rate reached 4.2 trillion marks to one US dollar, and workers were reportedly paid twice daily so they could spend their wages before they lost value. Hungary in 1946 produced the highest inflation rate ever recorded: prices doubled every 15 hours at the peak. The 1946 Hungarian pengő became so worthless that a new currency — the forint — was introduced at 400 octillion (4 × 10²⁹) pengős to one forint. Zimbabwe's 2008–09 crisis produced the famous 100 trillion dollar note — worth less than US$0.40 at the time of issue, and now worth far more as a collector's item.",
  },
  {
    kind: "facts",
    title: "The worst hyperinflations in recorded history",
    facts: [
      { label: "Hungary 1946 (worst ever)", value: "Peak rate: 4.19 × 10¹⁶% per month; prices doubled every 15 hours" },
      { label: "Zimbabwe 2008", value: "Peak rate: 79.6 billion % per month; 100 trillion dollar note issued" },
      { label: "Yugoslavia 1994", value: "Peak rate: 313 million% per month; prices doubled every 34 hours" },
      { label: "Weimar Germany 1923", value: "4.2 trillion marks = 1 US dollar at peak in November 1923" },
      { label: "Venezuela 2018", value: "1,370,000% annual inflation; bolivar replaced by bolivar soberano (cut 5 zeros)" },
      { label: "Zimbabwe resolution 2009", value: "Abandoned own dollar; adopted multi-currency basket (USD, ZAR, EUR, GBP)" },
    ],
  },
  {
    kind: "image",
    art: "article-zimbabwe-100-trillion",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Zimbabwe_100_trillion_2009_Obverse.jpg/1280px-Zimbabwe_100_trillion_2009_Obverse.jpg",
    caption: "Zimbabwe's 100 trillion dollar note (2008) — the most iconic physical symbol of hyperinflation, now a collector's item worth far more than its original face value.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "Weimar Germany's hyperinflation wiped out middle-class savings in months. People who had followed conventional financial advice — saved in bonds, avoided debt, lived frugally — were left destitute. Those who had borrowed and bought physical assets (land, factories) effectively saw their debts vanish. Many historians argue that this experience of currency destruction was a prerequisite for the political radicalisation of the 1920s and 1930s.",
  },

  { kind: "heading", id: "currency-pegs", text: "Currency pegs: stability at a price" },
  {
    kind: "paragraph",
    text: "A currency peg fixes the exchange rate between a country's currency and a reference currency — usually the US dollar or euro. The benefits are straightforward: predictable exchange rates reduce business risk, encourage trade and investment, and import the credibility of the reference currency's central bank. The costs are equally clear: the pegging country cannot use monetary policy to respond to domestic economic shocks. Hong Kong has maintained a peg to the US dollar at approximately 7.8 HKD:1 USD since 1983 through a currency board — every Hong Kong dollar in circulation is backed by a US dollar held in reserve. Gulf Cooperation Council states — Saudi Arabia, UAE, Bahrain, Oman, Qatar — maintain dollar pegs reflecting that their primary export (oil) is priced in dollars and the peg eliminates exchange rate risk for their dominant trade.",
  },
  {
    kind: "dualCompare",
    title: "Currency peg vs. free float",
    leftTitle: "Pegged currency — advantages",
    leftItems: [
      "Predictable exchange rates for traders and investors",
      "Imports anti-inflationary credibility from reference currency",
      "Reduces exchange rate speculation if peg is credible",
      "Simplifies cross-border pricing and contracts",
      "Example: Hong Kong dollar, stable at ~7.8 HKD:USD since 1983",
    ],
    rightTitle: "Free float — advantages",
    rightItems: [
      "Monetary policy can respond to domestic economic shocks",
      "Exchange rate acts as automatic stabiliser for trade balance",
      "No need to hold large foreign exchange reserves",
      "Currency can depreciate to restore export competitiveness",
      "Example: British pound, Japanese yen, Australian dollar",
    ],
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "Argentina maintained a one-to-one peso-dollar peg from 1991 to 2001, initially eliminating hyperinflation. When the peg became unsustainable due to overvaluation, Argentina defaulted on $100 billion in debt — then the largest sovereign default in history — and the peso devalued by 75% within weeks. The crisis produced five presidents in two weeks and a decade of economic disruption, demonstrating the catastrophic downside risk of an unsustainable peg.",
  },

  { kind: "heading", id: "dollarization", text: "Dollarization: adopting someone else's currency" },
  {
    kind: "paragraph",
    text: "Dollarization — formally adopting a foreign currency as legal tender — is the most extreme form of monetary surrender. The country immediately gains credibility: inflation is imported from the issuing country's central bank rather than generated at home. What it loses is equally significant: control over interest rates, the ability to print money in a crisis, seigniorage (the profit governments earn from issuing currency), and exchange rate adjustment as an economic tool. El Salvador dollarized in 2001 and added Bitcoin as a second legal tender in September 2021, becoming the first country in history to give cryptocurrency legal tender status. The Bitcoin experiment encountered immediate problems — few merchants genuinely accepted it, the government Chivo wallet suffered technical failures, and the IMF strongly opposed the experiment. By 2023, El Salvador had quietly softened Bitcoin's mandatory acceptance requirements.",
  },
  {
    kind: "list",
    items: [
      "Panama: uses USD since 1904 alongside the balboa (1:1 fixed); longest continuous dollarisation — never experienced hyperinflation.",
      "Ecuador: dollarized in 2000 after the sucre collapsed; inflation fell from 96% in 1999 to single digits within two years.",
      "El Salvador: dollarized 2001; added Bitcoin legal tender 2021; mandatory acceptance effectively dropped by 2023.",
      "Zimbabwe: abandoned own currency 2009; uses multi-currency basket; attempted reintroduction of Zimbabwean dollar in 2019.",
      "Montenegro and Kosovo: use the euro without being EU members; cannot issue euros or vote on ECB policy.",
      "Timor-Leste: uses USD as official currency since independence in 2002; centavo coins issued for small transactions.",
    ],
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "A dollarised country loses what economists call the 'lender of last resort' function: when banks fail, the government cannot print money to bail them out. Ecuador's banking system remained fragile for years after dollarisation. Panama's banks, however, are notably well-regulated and stable — suggesting that dollarisation alone does not determine banking health; the quality of regulation matters more.",
  },

  { kind: "heading", id: "what-on-banknotes", text: "What's on the banknotes: national identity in circulation" },
  {
    kind: "paragraph",
    text: "The imagery on banknotes follows predictable patterns across political systems. Monarchies feature the reigning sovereign — the UK's notes have shown the monarch's profile since the 1960s, updated with each accession. Republican governments favour founding fathers or independence heroes. The US dollar's Washington, Lincoln, Hamilton, and Franklin represent a deliberate canon of the republic's origins. China's renminbi features Mao Zedong on every denomination — a choice that combines political symbolism with the practical benefit of making counterfeiting detectable by face familiarity. Some countries have moved in a different direction entirely: the new Norwegian krone series (2017) uses abstract pixelated imagery inspired by the sea on its reverse, while the UK's new polymer notes feature scientists and artists — Alan Turing, Jane Austen, J.M.W. Turner — rather than political figures.",
  },
  {
    kind: "list",
    items: [
      "UK pound: King Charles III on obverse; reverse features scientists and cultural figures (Alan Turing on £50, Jane Austen on £10, Turner on £20).",
      "India rupee: Mahatma Gandhi on all notes; reverse rotates through science, culture, nature, and infrastructure imagery.",
      "Canada dollar: former monarchs plus notable Canadians; $1 coin 'loonie' features the common loon — one of the world's most recognisable coins.",
      "Norway krone (2017 series): coastal landscapes, lighthouses on front; pixelated abstract seascapes on reverse — the most avant-garde major currency design.",
      "New Zealand dollar: endemic birds (kiwi, hoiho penguin, kākāpō) and King on notes — among the most ecologically themed currency series.",
      "China renminbi: Mao Zedong on all denominations; reverses show national landmarks (Great Hall, Potala Palace, Li River).",
    ],
  },
  {
    kind: "image",
    art: "article-new-zealand-kiwi-coin",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/New_Zealand_one_dollar_coin.jpg/800px-New_Zealand_one_dollar_coin.jpg",
    caption: "New Zealand's one-dollar coin featuring the kiwi — a globally recognised use of endemic wildlife on national currency, reflecting New Zealand's ecological identity.",
    credit: "Wikimedia Commons / Public Domain",
  },

  { kind: "heading", id: "coins-that-tell-stories", text: "The coins that tell stories" },
  {
    kind: "paragraph",
    text: "Before paper money dominated, coins were the primary medium of international trade, and their designs spread wherever merchants travelled. The Roman denarius circulated across the known world from Britain to India during the empire's height, carrying imperial propaganda — the emperor's profile, military victories, divine associations — into every corner of the Roman economy and beyond. The Spanish silver peso, or 'piece of eight', became effectively the world's first global currency between the 1600s and early 1800s. Minted in Mexico and Peru from the vast silver deposits of Potosí, pieces of eight circulated in China, India, the Caribbean, and colonial North America simultaneously. They were legal tender in the United States until 1857. Modern commemorative coins continue this tradition in miniature: the British Royal Mint issues several hundred special editions per year, each depicting events, anniversaries, and figures ranging from Shakespeare to David Bowie.",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The US dollar sign ($) may derive from the Spanish peso abbreviation 'ps' — the superposition of P and S evolving over time into the familiar symbol. The first US silver dollars were designed to be identical in size and weight to the Spanish peso to ensure immediate acceptance in trade, since the peso was already trusted throughout the Americas.",
  },

  { kind: "heading", id: "cbdcs", text: "Central bank digital currencies and the next geography" },
  {
    kind: "paragraph",
    text: "Central Bank Digital Currencies (CBDCs) are government-issued digital money — not cryptocurrency, but a digital version of a national currency with legal tender status and central bank backing. Over 100 countries had CBDC projects at some stage of development as of 2024. China's digital yuan (e-CNY) is the most advanced major-economy CBDC, with trials in multiple cities and integration into retail payment apps. China's motivations are multiple: reducing reliance on Alipay and WeChat Pay (which dominate retail payments through private companies), gaining real-time transaction data, and eventually enabling cross-border transactions that bypass dollar-denominated systems. The Bahamas' Sand Dollar (2020) was the world's first fully deployed CBDC — designed to serve island communities where physical bank branches are impractical.",
  },
  {
    kind: "image",
    art: "article-digital-yuan-ecny",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Digital_RMB_app.jpg/800px-Digital_RMB_app.jpg",
    caption: "China's digital yuan (e-CNY) wallet interface — the most widely tested central bank digital currency in a major economy, trialled across multiple Chinese cities.",
    credit: "Wikimedia Commons / CC BY-SA 4.0",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "CBDCs differ from cryptocurrencies in one fundamental way: they are issued and controlled by a central bank, making them inherently centralised. Bitcoin's value proposition is decentralisation — no single authority controls it. A CBDC is the opposite: it gives governments potentially greater surveillance and control over financial transactions than physical cash, which is anonymous by design.",
  },

  { kind: "heading", id: "exchange-rates-geography", text: "Exchange rates and the geography of tourism" },
  {
    kind: "paragraph",
    text: "Exchange rates shape travel patterns as much as visa policies or flight routes. When a currency is strong — as the US dollar was against the pound and euro in 2022–2023 — American tourists find European prices relatively cheap; Europeans visiting the US face elevated real costs. The practical geography of tourism responds to exchange rate cycles: Thailand's baht, Turkey's lira, and Argentina's peso have all at various times been so undervalued against hard currencies that they attracted price-sensitive visitors despite other barriers. The concept of Purchasing Power Parity (PPP) corrects for this by asking how much a standardised basket of goods costs in different countries: it consistently shows that poorer countries are cheaper in absolute terms, meaning currency strength understates the real living standards of citizens in high-income countries and overstates them in low-income ones.",
  },

  { kind: "heading", id: "big-mac-index", text: "The Big Mac Index: a popular economics benchmark" },
  {
    kind: "paragraph",
    text: "The Big Mac Index, created by The Economist magazine in 1986, compares the price of a McDonald's Big Mac in different countries converted to US dollars at market exchange rates. Because the Big Mac is a standardised product produced using local labour and local ingredients, its price in different countries reflects local costs — wages, rent, farming — rather than international commodity markets. When the index shows a Big Mac costs $5.58 in the US and $7.73 in Switzerland, it suggests the Swiss franc is significantly overvalued in purchasing power terms. When it costs $1.66 in Indonesia, the rupiah is significantly undervalued. The index is not rigorous economics — service prices notoriously vary more across countries than traded-goods prices — but it has proven durable as a simple, memorable illustration of exchange rate misalignment.",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "Big Mac prices (2023): United States $5.58 · Switzerland $7.73 · Norway $7.02 · UK $5.09 · Brazil $4.28 · China $3.38 · Egypt $2.20 · Indonesia $1.66. Switzerland's figure implies the franc is roughly 38% overvalued against the dollar; Indonesia's implies the rupiah is roughly 70% undervalued by purchasing power parity.",
  },

  { kind: "heading", id: "strong-currencies", text: "The geography of strong and weak currencies" },
  {
    kind: "paragraph",
    text: "The world's strongest currency by exchange rate is the Kuwaiti dinar (KWD), worth approximately $3.26 as of 2024. Kuwait's dinar derives its strength from massive oil revenues relative to a small population — generating surpluses that allow the central bank to maintain a dollar peg without inflationary pressure. The Bahraini dinar ($2.65) and Omani rial ($2.60) are second and third for similar reasons. The Swiss franc occupies a different category: it is strong because Switzerland has run current account surpluses for decades, maintains low inflation, and serves as the world's pre-eminent safe-haven currency — investors buy francs when global risk rises, regardless of Swiss domestic conditions. Japan presents a paradox: the world's third-largest economy has a currency worth less than a US cent per unit, partly because Japan historically maintained weak yen to support export industries, and partly because Japan's near-zero interest rates made the yen a 'carry trade' currency borrowed cheaply and invested elsewhere.",
  },
  {
    kind: "facts",
    title: "Currency strength at a glance (2024)",
    facts: [
      { label: "World's strongest (by exchange rate)", value: "Kuwaiti dinar (KWD): ~$3.26 per 1 KWD" },
      { label: "Bahraini dinar", value: "~$2.65 per 1 BHD — oil-backed Gulf currency" },
      { label: "Swiss franc safe-haven", value: "~$1.13 per 1 CHF; strengthens in global crises" },
      { label: "Iranian rial (weakest)", value: "~$0.000024 per 1 IRR — under heavy sanctions" },
      { label: "Most stable peg", value: "Hong Kong dollar at 7.8:1 USD — maintained since 1983" },
      { label: "Most volatile major currency (2023)", value: "Turkish lira — lost ~30% vs USD in one calendar year" },
    ],
  },

  { kind: "heading", id: "colonial-currency-legacies", text: "Colonial currency legacies: the CFA franc" },
  {
    kind: "paragraph",
    text: "Some of the most revealing currency stories concern what was kept after independence. The CFA franc — Communauté Financière Africaine — is used by 14 African states across two zones: eight in West Africa (WAEMU) and six in Central Africa (CEMAC). Created by France in 1945 for its African territories, the CFA franc was pegged to the French franc and is now pegged to the euro at a fixed rate. In exchange for France's guarantee of convertibility, member countries historically deposited 50% of their foreign exchange reserves at the French Treasury in Paris. Critics argue this arrangement gives France ongoing influence over the monetary policy of 14 sovereign nations and extracts African reserves to Paris. Supporters argue it provides price stability and credibility that West African countries would struggle to achieve independently, pointing to inflation rates that are consistently lower in CFA zones than in neighbouring non-CFA countries.",
  },
  {
    kind: "image",
    art: "article-cfa-franc-notes",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/CFA_franc_BCEAO.jpg/1280px-CFA_franc_BCEAO.jpg",
    caption: "West African CFA franc banknotes — the currency of 8 countries, pegged to the euro at 655.96 XOF per euro, and subject to ongoing political debate about French oversight.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The CFA franc was devalued by 50% in January 1994 — the largest single monetary shock in post-independence African history. The devaluation, coordinated with France and the IMF, temporarily boosted export competitiveness but halved the purchasing power of populations in 14 countries overnight. In December 2019, West African nations announced the CFA franc would be renamed the 'eco' and France's Treasury role ended — but as of 2024, the transition remains incomplete.",
  },

  { kind: "heading", id: "other-colonial-currency-zones", text: "Other colonial currency zones" },
  {
    kind: "paragraph",
    text: "The CFA franc is the most prominent but not the only currency zone shaped by colonial history. The East Caribbean Dollar, created in 1965, is used by eight Eastern Caribbean states — including Antigua and Barbuda, Dominica, Grenada, and Saint Lucia — and is pegged to the US dollar at 2.70 XCD:1 USD. It is managed by the Eastern Caribbean Central Bank (ECCB), one of only two currency unions in the world where the central bank is genuinely shared (the other is the eurozone). The CFP franc, created for French Pacific territories, is used in French Polynesia, New Caledonia, and Wallis and Futuna — all still technically French collectivities — and is pegged to the euro. The pattern is consistent: post-colonial currency zones tend to preserve both the monetary arrangements and the political relationships of the colonial period.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "The Eastern Caribbean Dollar has maintained the same peg rate of 2.70:1 USD since 1976 — nearly 50 years of fixed exchange rate stability, maintained through the East Caribbean Central Bank. This makes it one of the longest-running successful pegs in the world, comparable to Hong Kong's peg established in 1983.",
  },

  { kind: "heading", id: "currency-wars", text: "Currency wars and competitive devaluation" },
  {
    kind: "paragraph",
    text: "When a country deliberately weakens its currency to make its exports cheaper, it is engaging in competitive devaluation — what former Brazilian Finance Minister Guido Mantega famously called a 'currency war' in 2010. Japan's Bank of Japan has periodically intervened to weaken the yen, since Japanese exporters (Toyota, Sony, Honda) profit enormously when the yen is cheap relative to the dollar and euro. China has been repeatedly accused by the United States of keeping the yuan artificially undervalued to support Chinese manufacturing — the US Treasury officially designated China a currency manipulator in 2019 before reversing the label in 2020 under different political circumstances. The difficulty is that every country has a legitimate argument for its own exchange rate policy, and distinguishing manipulation from domestic monetary stimulus is genuinely contested.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "The phrase 'currency war' describes a situation where multiple countries simultaneously try to weaken their currencies to boost exports — effectively competing to be the cheapest producer. The paradox is that not everyone can simultaneously win: if all currencies weaken equally against each other, relative competitiveness is unchanged, and the net effect is simply global inflation.",
  },

  { kind: "heading", id: "world-currencies-table", text: "Ten currencies at a glance" },
  {
    kind: "table",
    title: "Selected world currencies: exchange rates and notable imagery (2024)",
    columns: ["Currency", "Code", "Approx. units per USD", "Notable banknote imagery"],
    rows: [
      ["US Dollar", "USD", "1.00 (baseline)", "Founding fathers (Washington, Lincoln, Hamilton); Great Seal"],
      ["Euro", "EUR", "0.92 EUR per USD", "Fictional European architectural styles — no real buildings"],
      ["Kuwaiti Dinar", "KWD", "0.31 KWD per USD (~$3.26 per KWD)", "Traditional dhow, oil refinery, national coat of arms"],
      ["Swiss Franc", "CHF", "0.88 CHF per USD (~$1.13 per CHF)", "Cultural figures: Le Corbusier, Euler, Ramuz, Kirchner"],
      ["Japanese Yen", "JPY", "149 JPY per USD", "Fukuzawa Yukichi; Mt Fuji and cherry blossoms on ¥1,000"],
      ["Chinese Renminbi", "CNY", "7.24 CNY per USD", "Mao Zedong on all notes; national landmarks on reverses"],
      ["British Pound", "GBP", "0.79 GBP per USD (~$1.27 per GBP)", "King Charles III; scientists and artists on reverse"],
      ["Indian Rupee", "INR", "83 INR per USD", "Mahatma Gandhi; rotating national development imagery"],
      ["Nigerian Naira", "NGN", "1,500 NGN per USD", "National independence heroes; CBN building"],
      ["West African CFA Franc", "XOF", "600 XOF per USD (pegged to EUR)", "African cultural scenes; development imagery"],
    ],
  },

  { kind: "heading", id: "currency-world-records", text: "Currency world records" },
  {
    kind: "facts",
    title: "Records in the world of currencies",
    facts: [
      { label: "Oldest continuously used currency", value: "British pound sterling (~775 AD to present — over 1,200 years)" },
      { label: "Most inflated banknote ever circulated", value: "Hungarian 100 quintillion pengő (1946) — worst hyperinflation ever recorded" },
      { label: "Largest nominal denomination", value: "Zimbabwe $100 trillion (2009); worth less than US$0.40 at time of issue" },
      { label: "Most traded currency", value: "US dollar — involved in 88% of all forex trades globally (2022)" },
      { label: "Most countries on one currency", value: "Euro — 20 EU member states plus several non-EU territories" },
      { label: "First paper money in history", value: "Chinese 'jiaozi' (交子), approximately 7th century AD under Tang Dynasty" },
    ],
  },

  ...editorialClosing({
    conclusion:
      "A currency is a geographic and political document as much as an economic instrument. Its design tells you what a government celebrates. Its exchange rate tells you how the world values that economy. Its history tells you whether the government has kept faith with its population. The CFA franc reveals the persistence of colonial financial architecture across 14 African nations. Zimbabwe's trillion-dollar note preserves the record of an economic collapse. The euro's fictional buildings document a political compromise that twelve nations could not resolve any other way. Reading a currency carefully is reading a country's relationship with its own past — and with every other country it trades with.",
    remember:
      "88% of forex trades involve the USD on one side. The euro depicts fictional, not real, European buildings. The Kuwaiti dinar is the world's strongest currency at ~$3.26. Hungary in 1946 suffered the worst hyperinflation ever recorded. The CFA franc ties 14 African nations to a euro peg under French oversight established in 1945.",
    quizTopic: "currencies and economic geography",
  }),
];
