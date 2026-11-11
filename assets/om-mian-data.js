// Om MIAN, alt innhold på historiesiden samlet på ett sted.
// Bytt tekster, milepæler, tidsstempler og produkter her. Siden tegnes fra denne filen.
// Felt merket PLASSHOLDER må erstattes med ekte materiale fra MIAN.
window.OM_MIAN = {
  // Klokken i hjørnet: starter her og tikker frem til slutt-tiden gjennom hele siden.
  klokke: { start: '05:12', slutt: '08:45' },

  // Hvert kapittel: himmel = fargene himmelen går gjennom fra topp til bunn av kapittelet (to eller flere), som navn på palett-tokens
  // i assets/site.css. Slutten på ett kapittel må være starten på det neste, så overgangen blir jevn.
  kapitler: [
    {
      id: '00', nr: '00', kort: 'Åpning',
      tittel: 'Alt begynner med en start',
      lead: 'Før huset våkner, før dagen har bestemt seg, står noen på kjøkkenet og lager kaffe.',
      himmel: ['--night-950', '--night-950'],
    },
    {
      id: '01', nr: '01', kort: '45 dager',
      tittel: 'Fra idé til første kaffepose på 45 dager',
      lead: 'MIAN begynte som en idé i Kristiansand. 45 dager senere ble den første posen levert, etter tidlige morgener, sene kvelder og mye kaffetesting.',
      himmel: ['--night-950', '--brown-800'],
    },
    {
      id: '02', nr: '02', kort: 'Morgentimene',
      tittel: 'Bygget før resten av huset våknet',
      lead: 'Mikal Mian er trebarnsfar og gründer med fulltidsjobb ved siden av. MIAN ble bygget i tidlige morgentimer og på kvelder, og flere har blitt med underveis.',
      himmel: ['--brown-800', '--plum-700', '--pink-200'],
    },
    {
      id: '03', nr: '03', kort: 'Navnet',
      tittel: 'Alt begynner med en start',
      lead: 'Den første koppen om morgenen, begynnelsen på en samtale, øyeblikket du bestemmer deg. MIAN betyr start.',
      himmel: ['--pink-200', '--yellow-400'],
    },
    {
      id: '04', nr: '04', kort: 'Samtalen',
      tittel: 'Noen samtaler trenger en start',
      lead: 'Sammen med Tør å si det jobber vi for mer åpenhet om psykisk helse, særlig blant menn.',
      himmel: ['--yellow-400', '--cream-100'],
    },
    {
      id: '05', nr: '05', kort: 'Ambisjonen',
      tittel: 'God kaffe. Bedre dager.',
      lead: 'Vi vil gjøre det enkelt å finne en kaffe du liker, enten du maler bønnene selv eller vil ha den ferdig malt.',
      himmel: ['--cream-100', '--white'],
    },
  ],

  // Kapittel 01: milepæler i kalenderen. dag = 1 til 45. bilde = filsti, eller null for plassholder.
  // PLASSHOLDER: alle dager, tekster og bilder under er eksempler.
  dager: 45,
  milepaeler: [
    { dag: 1,  tekst: 'Dag 1, idéen skrives ned',            bilde: null },
    { dag: 3,  tekst: 'Dag 3, første testbrenning',          bilde: null },
    { dag: 12, tekst: 'Dag 12, navnet MIAN bestemmes',       bilde: null },
    { dag: 21, tekst: 'Dag 21, posene kommer fra trykkeriet', bilde: null },
    { dag: 34, tekst: 'Dag 34, de første bestillingene',     bilde: null },
    { dag: 45, tekst: 'Dag 45, første pose levert',          bilde: null },
  ],
};
