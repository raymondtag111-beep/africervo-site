// =============================================
// SCRIPT DE SYNCHRONISATION — à coller dans la console du navigateur
// pendant que la page admin.html est ouverte et chargée (connecté à Firebase).
// Il pousse les textes optimisés et les images corrigées vers Firestore
// pour les 20 produits, en utilisant votre fonction updateProduct() existante.
// =============================================

const UPDATES = {
  "1": {
    "title1": "😤 Encore ces zones vides que ta barbe refuse de combler ?",
    "desc1": "Tu regardes ta barbe dans le miroir et tu vois ces zones vides qui refusent de pousser. Tu ramasses des cheveux sur ton oreiller chaque matin. Cette huile 100% naturelle agit directement à la racine pour arrêter la chute et relancer la pousse — barbe et cheveux, hommes comme femmes. La solution naturelle que tu attendais enfin, pour retrouver densité et confiance.",
    "list1": "🌱 Agit dès la racine\n🛑 Stoppe la chute progressivement\n🧑🏾 Comble les zones clairsemées\n👫🏾 Convient hommes & femmes",
    "title2": "⏱️ 2 minutes par jour, pas une routine compliquée",
    "desc2": "Tu as déjà essayé des produits compliqués, chers, ou qui ne donnent aucun résultat après des semaines d'attente ? Cette huile s'applique en 2 minutes chrono, matin ou soir, et pénètre immédiatement sans laisser de film gras sur ta peau. Deux minutes par jour suffisent pour voir enfin la différence que tu espérais.",
    "list2": "⏱️ 2 minutes d'application\n🧴 Aucun effet gras\n🧼 S'utilise sur barbe ET cheveux\n📅 Utilisation quotidienne simple",
    "title3": "🌿 Barbe dense, cheveux forts, 100% naturellement",
    "desc3": "Grâce à ses ingrédients puissants (huiles naturelles nourrissantes), ta barbe et tes cheveux retrouvent vigueur et densité en quelques semaines. Fini de te cacher ou d'éviter les photos de près — retrouve confiance en ton reflet. C'est exactement la solution qu'il te fallait, simple, naturelle et efficace.",
    "list3": "🌿 100% ingrédients naturels\n💧 Hydrate en profondeur\n🔬 Renforce dès les racines\n😎 Confiance retrouvée",
    "titleCarousel": "✅ Ils avaient les mêmes doutes que toi, au début",
    "descCarousel": "100% naturelle et sans effet gras, cette huile agit dès la racine : nos clients togolais témoignent d'une barbe plus dense et de cheveux renforcés en quelques semaines seulement.",
    "listCarousel": "⭐ Résultats visibles dès 3 semaines\n🌱 100% ingrédients naturels\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/1.jpg"
    ]
  },
  "2": {
    "title1": "📵 Encore obligé de sortir ton téléphone à chaque notification ?",
    "desc1": "Appel, message, WhatsApp — à chaque fois tu dois fouiller ta poche ou ton sac. La SK40 t'affiche tout directement au poignet, avec haut-parleur et micro intégrés pour répondre sans même toucher ton téléphone. La liberté que tu cherchais enfin à portée de poignet, sans compromis.",
    "list1": "📞 Appels directs au poignet\n💬 Notifications WhatsApp/SMS\n🔊 Haut-parleur + micro intégrés\n📲 Compatible Android & iPhone",
    "title2": "🎵 Une vraie montre intelligente, pas juste un gadget",
    "desc2": "Musique, météo, contacts, écran AMOLED net et lumineux même en plein soleil — tout est fluide et simple à utiliser, même si tu n'es pas doué avec la technologie. Une vraie montre intelligente pensée pour être simple, exactement ce qu'il te faut.",
    "list2": "🎵 Contrôle musique à distance\n🌤️ Météo en temps réel\n🖥️ Écran AMOLED haute définition\n👆 Utilisation simple et intuitive",
    "title3": "❤️ Prends soin de ta santé sans même y penser",
    "desc3": "La SK40 surveille ton cœur, ton taux d'oxygène et ton sommeil pendant que tu vis ta journée normalement. Un simple coup d'œil au poignet te dit comment va ton corps. Prendre soin de toi n'a jamais été aussi simple, discret et rassurant.",
    "list3": "❤️ Suivi fréquence cardiaque\n🫁 Mesure du taux d'oxygène\n😴 Analyse du sommeil\n📊 Bilan santé quotidien automatique",
    "titleCarousel": "✅ Déjà au poignet de centaines de Togolais",
    "descCarousel": "Résistante à l'eau et à la sueur, avec une autonomie de 5 jours, la SK40 accompagne déjà nos clients togolais au travail, au sport et dans leurs sorties quotidiennes.",
    "listCarousel": "🔋 Autonomie jusqu'à 5 jours\n💧 Résistante à l'eau et à la sueur\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/M1.jpg"
    ]
  },
  "3": {
    "title1": "🎁 Le cadeau qui impressionne vraiment, sans se ruiner",
    "desc1": "Anniversaire, fête, cadeau surprise — tu cherches quelque chose d'utile ET qui en jette à l'ouverture du paquet. Ce coffret complet avec accessoires assortis fait toujours son effet, pour lui comme pour elle. Le cadeau parfait qui marque les esprits, exactement ce qu'il te faut pour impressionner.",
    "list1": "🎁 Coffret complet prêt à offrir\n✨ Design premium doré\n👨‍👩‍👧 Convient homme ou femme\n📦 Emballage cadeau soigné",
    "title2": "📲 Plus qu'une montre : ton assistant au poignet",
    "desc2": "Appels, notifications, suivi santé — tu gères tout sans sortir ton téléphone à chaque instant, même en réunion ou en pleine course. Un vrai assistant à ton poignet, prêt à simplifier chaque instant de ta journée.",
    "list2": "📞 Appels et notifications au poignet\n❤️ Suivi santé intégré\n🔋 Batterie longue durée\n📶 Connexion Bluetooth stable",
    "title3": "✨ Un seul coffret, plusieurs styles pour toutes les occasions",
    "desc3": "Pourquoi acheter trois accessoires séparément quand tu as tout dans un seul coffret ? Montre connectée, montre classique dorée et bijoux assortis — un style différent chaque jour. Trois accessoires, un seul prix, exactement la solution la plus maligne à offrir.",
    "list3": "⌚ Montre connectée incluse\n💍 Montre classique dorée incluse\n📿 Bijoux assortis inclus\n💰 Bien plus économique que séparément",
    "titleCarousel": "✅ Le cadeau qui a vraiment fait plaisir à nos clients",
    "descCarousel": "Regarde les photos de nos clients qui ont offert ce coffret complet : montre connectée, montre classique dorée et bijoux assortis, un cadeau qui a marqué chaque occasion spéciale.",
    "listCarousel": "🎁 Idéal anniversaire, fêtes, surprise\n✨ Design premium doré\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/A581.jpg"
    ]
  },
  "4": {
    "title1": "😩 Ta maison sent le renfermé dès que tu rentres ?",
    "desc1": "Entre la poussière, la chaleur et l'air sec de la saison, ton salon ou ta chambre manque de fraîcheur. Ce diffuseur transforme l'atmosphère en quelques minutes : brume légère, parfum agréable, lumière douce. Ta maison mérite cette ambiance apaisante que tu ressens dès la première utilisation.",
    "list1": "🌿 Assainit l'air ambiant\n💧 Brume légère et parfumée\n😌 Ambiance apaisante immédiate\n😴 Aide à mieux dormir",
    "title2": "🔥 Zéro risque d'incendie, contrairement aux bougies parfumées",
    "desc2": "Tu as essayé les bougies (qui prennent feu) et les sprays (qui ne durent pas) ? Ce mini humidificateur hydrate l'air en continu, sans risque, pour un intérieur plus respirable toute la journée. Enfin une solution sûre et durable, sans les risques des bougies ou sprays.",
    "list2": "💨 Rafraîchit la pièce\n💧 Hydrate l'air naturellement\n🫁 Respiration plus facile\n🕐 Diffusion longue durée",
    "title3": "💡 Branché en 10 secondes, ambiance zen immédiate",
    "desc3": "Compact et silencieux, il s'installe partout — chambre, salon, bureau. Branche, ajoute quelques gouttes d'huile essentielle ou d'eau, et profite d'une ambiance zen instantanément. Le petit geste qui transforme toute une pièce, exactement ce qu'il te faut.",
    "list3": "🔇 Fonctionnement silencieux\n💡 Lumière LED relaxante réglable\n🔋 Rechargeable USB\n🏡 S'adapte à toutes les pièces",
    "titleCarousel": "✅ Déjà adopté par des centaines de foyers togolais",
    "descCarousel": "Avec son réservoir de 300 ml et jusqu'à 8h de diffusion continue, ce diffuseur s'arrête automatiquement dès que l'eau est vide, pour une ambiance zen adoptée par des centaines de foyers togolais.",
    "listCarousel": "🧴 Réservoir 300 ml\n⏳ Jusqu'à 8h d'autonomie\n🛡️ Arrêt automatique sécurisé\n💯 Satisfait ou remboursé sous 30 jours",
    "images": [
      "images/dif1.jpg"
    ]
  },
  "5": {
    "title1": "🦶 Encore honte de montrer tes pieds en sandales ?",
    "desc1": "Sandales, tongs, pieds nus à la maison — tes talons secs et rugueux te gênent au quotidien. Cette lime électrique élimine les peaux mortes en quelques minutes, pour des pieds doux dès la première utilisation. La solution simple que tu cherchais, pour des pieds enfin doux sans effort.",
    "list1": "🦶 Élimine peaux mortes et callosités\n⚡ Résultat dès la 1ère utilisation\n🪫 Sans douleur, sans coupure\n🔋 Rechargeable, sans fil",
    "title2": "😣 Pourquoi payer l'institut chaque mois pour ça ?",
    "desc2": "Tu dépenses chaque mois en pédicure alors que tu pourrais le faire toi-même, chez toi, en 5 minutes ? Cette lime professionnelle t'évite les déplacements, l'attente et la facture. Le même résultat professionnel, chez toi, quand tu veux, sans dépenser inutilement.",
    "list2": "💰 Économise l'institut chaque mois\n🏠 Utilisable à la maison\n⏱️ Résultat en 5 minutes\n🔄 Deux vitesses de rotation",
    "title3": "🚀 Une pédicure professionnelle sans sortir de chez toi",
    "desc3": "Facile à prendre en main, silencieuse et efficace, elle s'utilise à tout moment — devant la télé, avant de sortir. Rechargeable, tu l'emportes même en voyage. Un geste simple qui change tout, exactement ce qu'il te faut au quotidien.",
    "list3": "🧴 Pieds doux et lisses durablement\n🔌 Batterie rechargeable USB\n🎒 Compacte et facile à transporter\n🧽 Nettoyage simple après usage",
    "titleCarousel": "✅ Le secret des pieds impeccables de nos clientes",
    "descCarousel": "Sans douleur ni coupure, cette lime électrique rechargeable élimine peaux mortes et callosités en quelques minutes : le secret des pieds doux et lisses de nombreuses clientes togolaises.",
    "listCarousel": "⭐ Résultat visible immédiatement\n🔋 Rechargeable, sans fil\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/lim1.jpg"
    ]
  },
  "6": {
    "title1": "⌚ Toujours joignable, même sans ton téléphone en main",
    "desc1": "Que tu sois au marché, en réunion ou en sport, la H92 Ultra 3 t'affiche appels et messages instantanément, avec un design premium qui attire tous les regards. La montre qui allie style et praticité, exactement ce qu'il te faut au poignet.",
    "list1": "📞 Appels et messages au poignet\n🖥️ Écran large ultra lumineux\n✨ Design premium et moderne\n📲 Compatible tous smartphones",
    "title2": "❤️ Elle veille sur ta santé même quand tu n'y penses pas",
    "desc2": "Fréquence cardiaque, sommeil, activité physique — la H92 Ultra 3 t'accompagne chaque jour sans effort, pour que tu gardes un œil sur ton bien-être sans y penser. Ta santé mérite ce suivi discret et constant, sans effort au quotidien.",
    "list2": "❤️ Suivi cardiaque en continu\n😴 Analyse du sommeil\n🏃🏾 Suivi d'activité physique\n🔋 Autonomie plusieurs jours",
    "title3": "🎁 Un coffret complet, plusieurs styles à porter",
    "desc3": "Livrée avec plusieurs bracelets interchangeables, tu changes de look selon l'occasion — sport, sortie, travail — sans acheter une nouvelle montre. Un seul achat, une infinité de styles, exactement la solution la plus maligne.",
    "list3": "🎀 Plusieurs bracelets inclus\n🔄 Changement rapide de style\n💼 Adaptée à toutes les occasions\n📦 Coffret cadeau soigné",
    "titleCarousel": "✅ Déjà adoptée par de nombreux clients togolais",
    "descCarousel": "Étanche IP67 et rechargée pour tenir jusqu'à 7 jours en veille, la H92 Ultra 3 garde son écran tactile réactif même avec les doigts humides, déjà adoptée par nos clients.",
    "listCarousel": "💧 Étanche IP67\n🔋 Jusqu'à 7 jours d'autonomie\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/H1.jpg"
    ]
  },
  "7": {
    "title1": "🥤 Envie d'un jus frais sans sortir de chez toi ni du bureau ?",
    "desc1": "Plus besoin d'attendre le vendeur de jus au coin de la rue ou de sortir le gros blender pour une seule portion. Ce mini mixeur portable prépare ton smoothie ou ton jus en quelques secondes, où que tu sois. La solution parfaite pour ta santé, prête en quelques secondes, où que tu sois.",
    "list1": "🍓 Jus frais en 30 secondes\n🔋 Rechargeable USB, sans fil\n🎒 Format compact et transportable\n🥤 Se boit directement dans la bouteille",
    "title2": "⚡ Pas besoin d'un blender géant pour un simple jus",
    "desc2": "Tu n'as pas la place pour un blender géant dans ta cuisine, ou tu veux juste un jus rapide le matin avant de partir ? Ses lames puissantes en inox mixent fruits et glaçons sans effort. Enfin un appareil pensé pour ta vraie vie, simple, compact et efficace.",
    "list2": "⚡ Lames en inox puissantes\n🧊 Mixe fruits et glaçons\n🏠 Idéal petits espaces\n🍹 Parfait pour smoothies et jus",
    "title3": "🌿 Petit format, grandes performances au quotidien",
    "desc3": "Léger, silencieux et facile à nettoyer (juste de l'eau et un peu de savon), il s'emporte partout — bureau, voiture, sport — pour boire sainement à tout moment de la journée. Le compagnon idéal pour une vie plus saine, sans jamais te compliquer la tâche.",
    "list3": "🌿 Nettoyage en 10 secondes\n🔋 Batterie rechargeable longue durée\n🎒 Idéal bureau, sport, voyage\n💧 Boisson toujours fraîche",
    "titleCarousel": "✅ Le compagnon santé que nos clients gardent sur eux",
    "descCarousel": "Avec sa capacité de 380 ml, ses 4 lames en inox et une charge de 2h offrant environ 15 utilisations, ce mixeur accompagne déjà le quotidien de nombreux clients togolais actifs.",
    "listCarousel": "🥤 Réservoir 380 ml\n🔪 4 lames en inox\n⚡ ~15 utilisations par charge\n💯 Satisfait ou remboursé sous 30 jours",
    "images": [
      "images/jus1.jpg"
    ]
  },
  "8": {
    "title1": "⏰ 20 minutes perdues chaque jour juste à couper les légumes ?",
    "desc1": "Entre le boulot, la maison et les enfants, tu n'as pas des heures à passer devant la planche à découper. Ce coupe-légumes multifonction tranche, râpe et découpe en quelques secondes, sans effort et sans te couper. Retrouve du temps pour toi chaque jour, sans sacrifier une cuisine bien faite.",
    "list1": "⏰ Découpe 3x plus rapide\n🖐️ Zéro risque de coupure\n🥕 Adapté à tous les légumes\n🧺 Bac de récupération intégré",
    "title2": "🍽️ 5 outils remplacés par un seul, ta cuisine respire enfin",
    "desc2": "Tu accumules couteaux, râpes et planches qui traînent partout ? Avec ses lames interchangeables, cet appareil remplace 5 outils en un seul, pour une cuisine plus rapide et plus rangée. Un seul outil, une cuisine enfin organisée, exactement ce dont tu rêvais.",
    "list2": "🔪 5 fonctions en un seul appareil\n🧼 Lames amovibles, faciles à laver\n📏 Découpe précise et uniforme\n🧹 Moins de vaisselle, moins de désordre",
    "title3": "🥗 Le repas de toute la famille prêt sans stress",
    "desc3": "Salades, sauces, accompagnements — prépare les repas du jour rapidement, même quand le temps manque. Compact, il se range facilement dans n'importe quel tiroir de cuisine. L'allié discret qui simplifie chaque repas, sans jamais encombrer ta cuisine.",
    "list3": "🥗 Idéal pour les repas de famille\n📦 Compact, se range partout\n👩🏾‍🍳 Simple à utiliser, même sans expérience\n⏱️ Gagne du temps chaque jour",
    "titleCarousel": "✅ L'allié discret de centaines de cuisines togolaises",
    "descCarousel": "Dans des dizaines de cuisines togolaises, ce coupe-légumes est devenu l'outil du quotidien : moins de temps passé à la découpe, plus de temps pour la famille chaque soir.",
    "listCarousel": "⭐ Utilisation quotidienne facile\n🔪 5 fonctions en un seul appareil\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/coup1.jpg"
    ]
  },
  "9": {
    "title1": "😔 Tu évites les selfies de près à cause de tes boutons ?",
    "desc1": "Tu évites les photos de près ou tu couvres ton visage de maquillage pour cacher les imperfections ? Le Green Mask Stick nettoie ta peau en profondeur et aide à réduire boutons et taches dès les premières applications. Ta peau mérite cette solution simple, déjà adoptée par des milliers de Togolais en confiance.",
    "list1": "🌿 Nettoie en profondeur\n🎯 Cible boutons et points noirs\n✨ Réduit l'apparence des taches\n👤 Convient à tous types de peau",
    "title2": "😍 2 minutes chrono pour une peau nette, sans 10 étapes",
    "desc2": "Fini les 10 étapes de skincare que tu n'as ni le temps ni l'argent de suivre. Ce masque stick pratique se roule directement sur la peau, purifie et contrôle l'excès de sébum en un geste simple. C'est le geste quotidien qui change tout, ta peau te dira merci.",
    "list2": "🧴 Application directe, sans les mains\n💧 Contrôle l'excès de sébum\n🕐 2 minutes suffisent\n💰 Remplace plusieurs produits",
    "title3": "⚡ Le seul geste skincare que tu tiendras vraiment sur la durée",
    "desc3": "Format stick pratique et rechargeable, il s'utilise matin ou soir, à la maison ou en déplacement, sans salir les mains ni le lavabo. Le seul soin dont tu as vraiment besoin, simple, efficace, et fait pour durer.",
    "list3": "⚡ Application rapide et propre\n🎒 Facile à transporter\n📆 Utilisation matin ou soir\n😊 Confiance en soi retrouvée",
    "titleCarousel": "✅ Des centaines de peaux nettes, une seule routine simple",
    "descCarousel": "Regarde les vraies photos avant/après de nos clientes togolaises : peau plus nette, pores resserrés et éclat retrouvé dès les premières semaines d'utilisation régulière.",
    "listCarousel": "⭐ Premiers résultats en 1 à 2 semaines\n🌿 Formule douce, sans paraben\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/mas1.jpg"
    ]
  },
  "10": {
    "title1": "🔪 Toujours la dernière à finir de préparer les légumes ?",
    "desc1": "Pendant que les autres sont déjà passés aux fourneaux, toi tu es encore à découper à la main. Cette mandoline multifonction coupe légumes et fruits en quelques secondes, avec une précision de chef. Gagne un temps précieux chaque jour, sans jamais sacrifier la qualité de tes plats.",
    "list1": "🔪 Découpe façon \\\"chef\\\" en secondes\n🥒 Julienne, tranches, dés\n🖐️ Poignée sécurisée anti-coupure\n📏 Épaisseur réglable",
    "title2": "⚡ Fini les couteaux qui glissent et les découpes ratées",
    "desc2": "Découper en tranches régulières à la main demande du temps et de la précision. Avec ses lames interchangeables, tu obtiens une découpe uniforme à chaque fois, sans effort. La découpe parfaite, à chaque fois, exactement ce dont ta cuisine avait besoin.",
    "list2": "⚡ Lames interchangeables incluses\n📐 Découpe toujours uniforme\n🛡️ Protection anti-coupure intégrée\n🧼 Facile à laver",
    "title3": "🥗 L'outil que chaque cuisine togolaise devrait avoir",
    "desc3": "Compacte et légère, elle se range facilement et t'accompagne pour préparer salades, accompagnements ou plats de fête sans y passer ta soirée. L'outil qui te fait gagner du temps chaque jour, sans jamais te compliquer la vie.",
    "list3": "🥗 Idéale pour salades et plats de fête\n📦 Compacte, se range partout\n⏱️ Gagne un temps précieux\n👩🏾‍🍳 Résultat digne d'un chef",
    "titleCarousel": "✅ Le secret des cuisines togolaises les plus rapides",
    "descCarousel": "Avec ses lames interchangeables et sa poignée anti-coupure, cette mandoline permet une découpe précise en quelques secondes, un vrai gain de temps déjà adopté par de nombreuses cuisines togolaises.",
    "listCarousel": "⭐ Découpe nette et rapide\n🖐️ Poignée sécurisée anti-coupure\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/man1.jpg"
    ]
  },
  "11": {
    "title1": "🦵 Jambes lourdes et pieds fatigués, encore ce soir ?",
    "desc1": "Tu rentres du travail avec les jambes gonflées et les pieds qui te font mal, sans savoir pourquoi ? Les patchs Kinoki agissent pendant ton sommeil pour t'aider à te sentir plus léger dès le réveil. La solution simple pour te réveiller enfin léger, sans effort ni contrainte.",
    "list1": "🦵 Soulage jambes et pieds fatigués\n😴 Agit pendant le sommeil\n🌙 Application simple le soir\n👣 Sensation de légèreté au réveil",
    "title2": "👣 La preuve visuelle que ça agit vraiment, chaque matin",
    "desc2": "Contrairement aux compléments qu'on avale sans rien voir, Kinoki te donne une preuve concrète chaque matin : plus le patch est foncé, plus ton corps en avait besoin. Une preuve concrète chaque matin, exactement ce qu'il te fallait pour y croire.",
    "list2": "👀 Preuve visible chaque matin\n🌿 Ingrédients naturels\n🩹 Sans médicament, sans avaler\n📆 Utilisation quotidienne simple",
    "title3": "☕ Marre de ce coup de barre qui revient chaque après-midi ?",
    "desc3": "Café, vitamines, sport… tu as tout essayé mais le coup de barre revient toujours. Kinoki t'aide à retrouver plus d'énergie naturellement, sans stimulant. Retrouve enfin ton énergie naturellement, sans caféine ni mauvaise surprise pour ton corps.",
    "list3": "⚡ Aide à retrouver de l'énergie\n🚫 Sans caféine, sans stimulant\n🌙 Agit la nuit, résultat le matin\n📦 Boîte de plusieurs patchs",
    "titleCarousel": "✅ Ils ont vu la différence dès la toute première nuit",
    "descCarousel": "Appliqués simplement le soir, ces patchs deviennent visiblement plus foncés au réveil : la preuve concrète que recherchent nos clients togolais après seulement quelques nuits d'utilisation régulière.",
    "listCarousel": "⭐ Résultat visible dès le matin\n🌿 Ingrédients 100% naturels\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/Detox1.jpg"
    ]
  },
  "12": {
    "title1": "📱 Encore en train de fouiller ton sac à chaque appel ?",
    "desc1": "Au volant, en marchant, en plein travail — sortir son téléphone à chaque appel ou message, c'est fatigant et parfois dangereux. Les M6 gèrent tout directement depuis l'écran tactile du boîtier. Enfin une solution plus sûre et plus pratique pour ton quotidien chargé.",
    "list1": "📞 Gère appels sans sortir le téléphone\n🖥️ Écran tactile sur le boîtier\n🔇 Réduction de bruit active\n🎧 Son immersif haute qualité",
    "title2": "🎮 Un écran tactile au poignet, ton téléphone reste rangé",
    "desc2": "Contrôle volume, musique et appels directement depuis le boîtier tactile, sans jamais avoir besoin de toucher ton téléphone — pratique en réunion, au sport ou en cuisine. Le contrôle total, littéralement au bout des doigts, sans jamais te compliquer la vie.",
    "list2": "🖐️ Contrôle tactile intuitif\n🎵 Gestion musique intégrée\n👂 Confort d'écoute longue durée\n📶 Connexion Bluetooth stable",
    "title3": "🔋 25h d'autonomie, jamais à court de batterie",
    "desc3": "Marre des écouteurs qui lâchent en plein après-midi ? Les M6 offrent une autonomie record avec leur boîtier de charge, pour t'accompagner du matin jusqu'au soir. Une autonomie qui ne te laisse jamais tomber, exactement ce qu'il te faut.",
    "list3": "🔋 Autonomie longue durée\n🔌 Boîtier de charge inclus\n🎚️ Plusieurs modes audio\n🎧 Adapté à tous les usages",
    "titleCarousel": "✅ Déjà dans les oreilles de centaines de clients togolais",
    "descCarousel": "Avec jusqu'à 25h d'autonomie grâce au boîtier tactile et une connexion Bluetooth 5.3 stable, les M6 sont déjà dans les oreilles de nombreux clients togolais au quotidien.",
    "listCarousel": "🔋 25h d'autonomie avec boîtier\n📶 Bluetooth 5.3 stable\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/m61.jpg"
    ]
  },
  "13": {
    "title1": "🩸 Encore clouée au lit à cause des crampes ce mois-ci ?",
    "desc1": "Chaque mois, les douleurs menstruelles t'empêchent de travailler, sortir ou même dormir tranquillement. Cette ceinture chauffante t'offre un soulagement naturel et immédiat, où que tu sois. Ne laisse plus jamais la douleur décider de ta journée, reprends enfin le contrôle.",
    "list1": "🔥 Chaleur apaisante immédiate\n🎒 Portable partout (travail, sortie)\n🩹 Soulagement sans médicament\n⚡ Effet ressenti en quelques minutes",
    "title2": "🌸 Zéro médicament, juste une chaleur qui soulage vraiment",
    "desc2": "Tu prends des anti-douleurs à répétition qui finissent par agresser ton estomac ? Cette ceinture agit par chaleur infrarouge profonde, une solution douce et naturelle contre les crampes. Ton corps mérite mieux que des médicaments, offre-lui un soulagement vraiment naturel.",
    "list2": "🌸 Chaleur infrarouge profonde\n🚫 Zéro médicament\n🔋 Rechargeable, réutilisable\n🎚️ Plusieurs niveaux de chaleur",
    "title3": "💖 Continue ta journée normalement, même ces jours-là",
    "desc3": "Ne laisse plus les douleurs dicter ton emploi du temps. Discrète sous les vêtements, cette ceinture t'accompagne au travail, en cours ou en sortie sans que personne ne le remarque. Vis enfin tes journées sans y penser, comme si la douleur n'existait plus.",
    "list3": "💖 Discrète sous les vêtements\n👩🏾 Pensée pour ton quotidien\n🔄 Réutilisable chaque mois\n😌 Confort et sérénité retrouvés",
    "titleCarousel": "✅ Le secret que des centaines de femmes togolaises se transmettent",
    "descCarousel": "Chaque mois, des centaines de femmes togolaises posent cette ceinture chauffante dès les premières crampes et retrouvent un vrai soulagement en quelques minutes seulement, sans médicament.",
    "listCarousel": "⭐ Soulagement dès les premières minutes\n🔥 3 niveaux de chaleur réglables\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide et discrète partout au Togo",
    "images": [
      "images/ceint1.jpg"
    ]
  },
  "14": {
    "title1": "👔 Une chemise froissée à 5 minutes d'un rendez-vous important ?",
    "desc1": "Chemise froissée à la dernière minute, pli tenace sur une robe avant un rendez-vous... Ce mini fer à repasser portable chauffe rapidement et lisse tes vêtements en quelques minutes, à la maison comme en déplacement. Ne laisse plus jamais un pli gâcher ton allure, la solution tient dans ton sac.",
    "list1": "🔥 Chauffe rapide\n👕 Lisse efficacement les plis\n🧳 Format compact pour le sac\n🏠 Idéal maison et voyage",
    "title2": "🪭 Se glisse dans ton sac, prêt en toutes circonstances",
    "desc2": "Sa poignée pliable réduit son encombrement pour le glisser facilement dans une valise, un sac de voyage ou un tiroir. Léger et simple à manier, il permet un repassage rapide sans sortir la planche à repasser. Compact et pratique, il t'accompagne partout, exactement ce qu'il te faut au quotidien.",
    "list2": "🪭 Poignée pliable et compacte\n🧺 Repassage rapide sans planche\n🎒 Léger, idéal pour le voyage\n🧑‍💼 Pratique pour les retouches de dernière minute",
    "title3": "✨ Des vêtements nets, en toute simplicité",
    "desc3": "Convient à la plupart des tissus courants (coton, polyester...) pour un résultat net rapidement. Pratique au quotidien pour les petites retouches, les chemises de bureau ou les vêtements des enfants. La solution simple pour des vêtements toujours impeccables, où que tu sois.",
    "list3": "🧵 Convient à la plupart des tissus courants\n👨‍👩‍👧 Pratique pour toute la famille\n⚡ Faible consommation électrique\n💼 Parfait pour le bureau et les voyages",
    "titleCarousel": "✅ Déjà utilisé à la maison et en voyage par nos clients",
    "descCarousel": "Compact et rapide à chauffer, ce mini fer se glisse dans n'importe quel sac : de nombreux clients togolais l'utilisent déjà à la maison comme en voyage pour des vêtements toujours nets.",
    "listCarousel": "⭐ Vêtements nets en quelques minutes\n🪭 Poignée pliable et compacte\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/fer-repasser-1.jpg"
    ]
  },
  "15": {
    "title1": "🍹 Encore à jongler entre 3 appareils différents en cuisine ?",
    "desc1": "Blender, hachoir, moulin — tu jongles entre plusieurs appareils qui prennent toute la place dans ta cuisine ? Le Moulinex Bardefu 8-en-1 fait tout : jus, smoothies, viande hachée, légumes, en un seul appareil puissant. Enfin la solution qui simplifie vraiment ta cuisine, sans sacrifier la puissance.",
    "list1": "⚡ 8 fonctions en un seul appareil\n💪 Moteur puissant 1000W\n🥤 Jus, smoothies, viande hachée\n🧊 Broie même la glace",
    "title2": "🍽️ Simplifie ta cuisine, gagne du temps chaque jour",
    "desc2": "Lames en inox robustes, bol de grande capacité — prépare les repas de toute la famille en une seule fois, sans avoir à répéter l'opération plusieurs fois. Un seul appareil pour toute la famille, exactement ce qu'il te faut à la maison.",
    "list2": "🥣 Grande capacité 4L\n🔪 Lames en inox robustes\n👨‍👩‍👧‍👦 Idéal pour toute la famille\n🧼 Bol amovible, facile à nettoyer",
    "title3": "🔥 Un seul appareil, plusieurs machines remplacées pour de bon",
    "desc3": "Pourquoi acheter blender, hachoir et mixeur séparément ? Ce Moulinex remplace plusieurs appareils, pour une cuisine plus rapide, plus efficace et moins encombrée. Un investissement malin qui te fait gagner temps, place et argent chaque jour.",
    "list3": "🔥 Remplace 3 appareils\n📦 Gain de place en cuisine\n⚡ Performance et rapidité\n💰 Un investissement rentable",
    "titleCarousel": "✅ Déjà dans les cuisines de nombreux foyers togolais",
    "descCarousel": "Avec son moteur puissant de 1000W, sa capacité de 4L et ses 8 fonctions (jus, smoothie, hachage, glace pilée), ce Moulinex s'est imposé dans de nombreuses cuisines togolaises, garantie incluse.",
    "listCarousel": "⚡ Moteur 1000W\n🥣 Capacité 4L\n🔧 8 fonctions incluses\n💯 Satisfait ou remboursé sous 30 jours",
    "images": [
      "images/mou1.jpg"
    ]
  },
  "16": {
    "title1": "👣 Tu caches tes mains ou tes pieds à cause des fissures ?",
    "desc1": "Le froid, la poussière et le manque d'hydratation attaquent ta peau chaque jour, jusqu'à ces fissures douloureuses sur les talons ou les mains. La crème Cindynal répare et protège durablement, dès les premières applications. Ta peau mérite cette réparation intense, pas de simples promesses en l'air.",
    "list1": "👣 Répare talons fissurés\n🤲 Hydrate mains abîmées\n🌿 Formule réparatrice intense\n⚡ Résultats dès les premiers jours",
    "title2": "🌿 Montre enfin tes mains et tes pieds sans complexe",
    "desc2": "Tu évites de porter des sandales ou de serrer la main par gêne à cause de ta peau sèche et rugueuse ? Cindynal réduit les fissures et hydrate en profondeur, pour une peau douce que tu n'auras plus envie de cacher. Montre enfin tes mains et tes pieds sans la moindre gêne, en toute confiance.",
    "list2": "🌿 Réduit fissures et craquelures\n💧 Hydratation intense et durable\n🚫 Sans effet gras\n✨ Peau visiblement plus douce",
    "title3": "⚡ 2 gestes par jour pour une peau vraiment réparée",
    "desc3": "Pas besoin de rituel compliqué : applique matin et soir sur les zones sèches et laisse la crème agir. Les résultats sont visibles dès les premiers jours d'utilisation. Deux gestes simples par jour, et ta peau change vraiment, c'est la solution.",
    "list3": "⏱️ 2 applications par jour suffisent\n📆 Résultats visibles rapidement\n🧴 Texture agréable, absorption rapide\n😊 Confiance retrouvée",
    "titleCarousel": "✅ La peau douce que nos clientes n'espéraient plus",
    "descCarousel": "Formulée pour réparer en profondeur talons craquelés et mains abîmées, Cindynal montre des résultats visibles dès les premiers jours, comme en témoignent nos clientes togolaises conquises.",
    "listCarousel": "⭐ Résultats dès les premiers jours\n🌿 Formule réparatrice intense et hydratante\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/cin1.jpg"
    ]
  },
  "17": {
    "title1": "🎧 Ta musique coupe encore en pleine rue ?",
    "desc1": "Fini les appels qui grésillent et la musique qui coupe en pleine rue. Les écouteurs Buds3 Pro offrent une connexion Bluetooth stable, un son clair et une réduction de bruit qui isole des bruits ambiants pour une écoute nette, même dans le bruit de la ville. Le son clair que tu mérites, sans interruption, où que tu sois.",
    "list1": "📶 Connexion Bluetooth stable\n🔇 Réduction de bruit active\n🎵 Son clair et équilibré\n⚡ Appairage automatique rapide",
    "title2": "🔋 Le boîtier qui recharge tes écouteurs n'importe où",
    "desc2": "Le boîtier de charge te permet de recharger tes écouteurs partout, même sans prise à proximité. Plusieurs heures d'écoute continue par charge, et le boîtier ajoute plusieurs recharges complètes avant de devoir le brancher. Une autonomie qui t'accompagne du matin au soir, sans jamais te lâcher.",
    "list2": "🔋 Autonomie prolongée avec boîtier\n⚡ Charge rapide par câble USB-C\n💧 Résistants à la sueur et aux éclaboussures\n👆 Contrôle tactile intégré",
    "title3": "✨ Conçus pour rester à l'oreille toute la journée",
    "desc3": "Compatibles avec tous les smartphones Android et iPhone, ces écouteurs s'adaptent naturellement à la forme de l'oreille pour un maintien stable, que ce soit pour le sport, les appels ou le travail. Conçus pour s'adapter à ta vie, pas l'inverse, exactement ce qu'il te faut.",
    "list3": "📱 Compatible Android & iPhone\n🏃🏾 Maintien stable pendant le sport\n🎙️ Micro intégré pour les appels\n🎁 Livrés avec boîtier de charge",
    "titleCarousel": "✅ Déjà dans les oreilles de nombreux clients togolais",
    "descCarousel": "Son clair, réduction de bruit active et boîtier de charge rapide : les Buds3 Pro accompagnent déjà de nombreux clients togolais dans leurs trajets, appels et séances de sport quotidiennes.",
    "listCarousel": "⭐ Son clair et net\n🔇 Réduction de bruit active\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/buds3pro-1.jpg"
    ]
  },
  "18": {
    "title1": "🚨 Et si quelqu'un entrait chez toi cette nuit ?",
    "desc1": "Que ce soit à la maison, au magasin ou en voyage, cette mini alarme anti-intrusion se fixe en quelques secondes sur une porte ou une fenêtre et déclenche une sirène puissante dès qu'un mouvement ou une ouverture est détecté. Ta tranquillité d'esprit mérite cette protection simple, efficace, et prête en quelques secondes.",
    "list1": "🔊 Sirène puissante et dissuasive\n🪟 Idéale pour portes et fenêtres\n⚡ Installation en 30 secondes\n🎒 Compacte et portable",
    "title2": "⚙️ Zéro technicien, zéro câblage, juste une protection efficace",
    "desc2": "Pas besoin d'installateur ni de branchement électrique : l'alarme fonctionne sur pile, se colle avec l'adhésif fourni et s'active en un geste. Parfaite pour un domicile, une boutique, une chambre d'hôtel ou un bureau. La sécurité ne devrait jamais être compliquée, voici enfin la solution la plus simple.",
    "list2": "🔋 Fonctionne sur pile, sans câblage\n🧲 Fixation adhésive rapide\n🏠 Maison, boutique, hôtel, bureau\n🧳 Idéale aussi en voyage",
    "title3": "🛡️ Dissuade avant même que l'intrusion commence",
    "desc3": "Le simple bruit strident suffit à faire fuir la plupart des intrus et à alerter immédiatement les personnes autour. Un moyen simple et économique de renforcer la sécurité de ton espace, jour et nuit. Une protection discrète mais redoutablement efficace, exactement ce qu'il te faut pour dormir tranquille.",
    "list3": "🚨 Alerte instantanée et forte\n🌙 Protection jour et nuit\n💰 Solution économique\n👨‍👩‍👧 Tranquillité pour toute la famille",
    "titleCarousel": "✅ Déjà installée dans des centaines de foyers togolais",
    "descCarousel": "Simple à fixer en 30 secondes sur une porte ou une fenêtre, cette mini alarme déclenche une sirène puissante à la moindre intrusion, déjà installée par de nombreux foyers togolais.",
    "listCarousel": "⭐ Sirène puissante et efficace\n⚡ Installation en 30 secondes\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/alarme-1.jpg"
    ]
  },
  "19": {
    "title1": "🌧️ Encore des chaussures mouillées à enfiler demain matin ?",
    "desc1": "Avec la saison des pluies à Lomé, difficile de sécher rapidement bottes, baskets ou chaussures de travail. Ce sèche-chaussures électrique diffuse une chaleur douce et homogène pour sécher l'intérieur de vos chaussures en quelques heures, sans les abîmer. La solution simple pour ne plus jamais sortir avec des chaussures mouillées.",
    "list1": "🔥 Chaleur douce et homogène\n👟 Sèche l'intérieur en profondeur\n🧦 Compatible chaussures, bottes, chaussons\n⚡ Faible consommation électrique",
    "title2": "🕒 Un minuteur pour ne jamais laisser branché trop longtemps",
    "desc2": "Réglez la durée de séchage selon vos besoins et laissez l'appareil s'arrêter automatiquement. Pratique le soir pour retrouver des chaussures sèches et prêtes le matin, sans risque de surchauffe. Un confort simple et sûr, pensé pour s'intégrer dans ta routine du soir.",
    "list2": "⏱️ Minuterie réglable\n🛑 Arrêt automatique sécurisé\n🌙 Idéal à utiliser la nuit\n👨‍👩‍👧 Sûr pour toute la famille",
    "title3": "😌 Fini les mauvaises odeurs liées à l'humidité",
    "desc3": "La chaleur diffusée aide aussi à réduire les mauvaises odeurs liées à l'humidité, pour des chaussures plus fraîches à chaque utilisation. Léger et compact, il se range facilement entre deux utilisations. Des chaussures fraîches et sèches, chaque jour, exactement ce qu'il te faut.",
    "list3": "🌬️ Réduit les mauvaises odeurs\n📦 Compact et facile à ranger\n🧺 Idéal aussi pour gants et chaussettes\n💧 Pratique en saison des pluies",
    "titleCarousel": "✅ Ils ne s'en passent plus en saison des pluies",
    "descCarousel": "En pleine saison des pluies, ce sèche-chaussures électrique est devenu indispensable pour de nombreux foyers togolais : chaussures sèches, sans mauvaises odeurs, prêtes dès le lendemain matin.",
    "listCarousel": "⭐ Chaussures sèches en quelques heures\n🛑 Arrêt automatique sécurisé\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/seche-chaussures-1.jpg"
    ]
  },
  "20": {
    "title1": "🎧 Tes écouteurs tombent encore en pleine rue ?",
    "desc1": "Contrairement aux petits écouteurs intra-auriculaires, le casque P9 Pro enveloppe confortablement l'oreille pour un son plus immersif et un maintien stable, que tu sois en appel, en musique ou en déplacement. Le confort que tu cherches depuis longtemps est enfin là, à portée de main.",
    "list1": "🎧 Maintien confortable autour de l'oreille\n📶 Connexion Bluetooth stable\n🎵 Son riche et immersif\n📱 Compatible tous smartphones",
    "title2": "🔋 La batterie qui ne te lâche jamais en pleine journée",
    "desc2": "Pliable et léger, le P9 Pro se glisse facilement dans un sac. Sa batterie offre plusieurs heures d'écoute en continu, et une charge complète en quelques heures via câble USB. Une autonomie pensée pour ton rythme de vie, sans jamais te laisser tomber.",
    "list2": "🔋 Longue autonomie en musique et appels\n🪭 Design pliable et compact\n🎙️ Micro intégré pour les appels\n⚡ Charge rapide par câble USB",
    "title3": "🎶 3 façons d'écouter ta musique, un seul casque",
    "desc3": "Le P9 Pro fonctionne en Bluetooth avec ton téléphone, mais aussi en mode filaire ou avec une carte mémoire pour écouter directement ta musique sans passer par ton téléphone. Un seul casque, mille façons de l'utiliser, exactement ce qu'il te faut.",
    "list3": "🔌 Mode filaire (jack 3.5mm) disponible\n💾 Lecture directe depuis carte mémoire\n📻 Radio FM intégrée\n🎁 Idéal pour offrir",
    "titleCarousel": "✅ Le casque que nos clients ne quittent plus",
    "descCarousel": "Autonomie prolongée, son riche et grave profond, micro clair pour les appels : le P9 Pro s'impose déjà dans le quotidien de nombreux clients togolais convaincus.",
    "listCarousel": "⭐ Son confortable et puissant\n🎧 Maintien stable toute la journée\n💯 Satisfait ou remboursé sous 30 jours\n🚚 Livraison rapide partout au Togo",
    "images": [
      "images/p9pro-1.jpg"
    ]
  }
};

async function syncOptimizedContent() {
    const ids = Object.keys(UPDATES);
    let ok = 0, fail = 0;
    for (const id of ids) {
        try {
            await window.productSync.updateProduct(id, UPDATES[id]);
            console.log(`✅ Produit ${id} synchronisé`);
            ok++;
        } catch (e) {
            console.error(`❌ Échec produit ${id}:`, e);
            fail++;
        }
        // petite pause pour ne pas saturer Firestore
        await new Promise(r => setTimeout(r, 300));
    }
    console.log(`\n🎉 Terminé : ${ok} produits mis à jour, ${fail} échec(s).`);
}

// Ce fichier est chargé par admin.html — la fonction est déclenchée par le bouton
// "Synchroniser le contenu optimisé" ajouté dans le tableau de bord, pas automatiquement.
window.syncOptimizedContent = syncOptimizedContent;

// =============================================
// Fonction appelée par le bouton "Synchroniser le contenu optimisé"
// du tableau de bord admin. Gère l'affichage (bouton désactivé pendant
// l'exécution, message de statut, résumé final).
// =============================================
async function runOptimizedSync() {
    const btn = document.getElementById('syncOptimizedBtn');
    const status = document.getElementById('syncOptimizedStatus');
    if (!confirm("Ceci va remplacer les titres, descriptions, listes, le bloc carrousel et l'image principale des 20 produits dans Firestore par la version optimisée. Continuer ?")) {
        return;
    }
    if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; btn.style.cursor = 'not-allowed'; }
    if (status) status.textContent = 'Synchronisation en cours...';

    const ids = Object.keys(UPDATES);
    let ok = 0, fail = 0;
    for (const id of ids) {
        try {
            await window.productSync.updateProduct(id, UPDATES[id]);
            ok++;
        } catch (e) {
            console.error(`Échec produit ${id}:`, e);
            fail++;
        }
        if (status) status.textContent = `Synchronisation en cours... (${ok + fail}/${ids.length})`;
        await new Promise(r => setTimeout(r, 300));
    }

    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
    if (status) status.textContent = `✅ ${ok} produits synchronisés${fail ? `, ${fail} échec(s)` : ''}.`;
    alert(`Synchronisation terminée : ${ok} produits mis à jour${fail ? `, ${fail} échec(s) (voir la console)` : ''}.`);
}

window.runOptimizedSync = runOptimizedSync;
