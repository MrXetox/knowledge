/**
 * Représentation d'un nœud de catégorie.
 * Note : Un nœud est soit une branche (contient children), soit une feuille (contient fiches_count).
 */
interface CategoryBase {
  id: number;
  name: string;
  position: number;
}

/**
 * Représentation d'une branche de catégorie (catégorie parent)
 * Peut contenir d'autres catégories enfants
 */
export interface CategoryBranch extends CategoryBase {
  special: typeof CategoryIcons[number];
  parent_id: null;
  children: CategoryLeaf[];
}

/**
 * Représentation d'une feuille de catégorie (catégorie enfant)
 * Peut contenir des fiches
 */
export interface CategoryLeaf extends CategoryBase {
  special: keyof typeof CategoryColors;
  parent_id: number;
  fiches_count: number;
}
export type CategoryNode = CategoryBranch | CategoryLeaf;

/**
 * Jeu d'icônes disponibles pour les catégories
 * Clefs utilisées pour la propriété special dans les branches
 */
export const CategoryIcons = [
  "lucideHome", "lucideBed", "lucideSofa", "lucideBath", "lucideUtensils",
  "lucideDoorOpen", "lucideKey", "lucideBuilding", "lucideStore", "lucideHotel",
  "lucideMapPin", "lucideMap", "lucideTreePine", "lucideFlower", "lucideTent",
  "lucideBriefcase", "lucideLaptop", "lucideMonitor", "lucideKeyboard", "lucideMouse",
  "lucidePrinter", "lucideFolder", "lucideFolderOpen", "lucideFile", "lucideFileText",
  "lucideClipboard", "lucidePenLine", "lucidePencil", "lucideNotebook", "lucideArchive",
  "lucideCalendar", "lucideCalendarDays", "lucideClock", "lucideAlarmClock", "lucideTimer",
  "lucideHourglass", "lucideBell", "lucideBellRing", "lucideCheckCircle", "lucideListTodo",
  "lucideWallet", "lucideCreditCard", "lucidePiggyBank", "lucideDollarSign", "lucideEuro",
  "lucideTrendingUp", "lucideTrendingDown", "lucideBanknote", "lucideReceipt", "lucideCoins",
  "lucideHandCoins", "lucideLandmark", "lucideCalculator", "lucideChartBar", "lucideChartPie",
  "lucideShoppingCart", "lucideShoppingBag", "lucideGift", "lucidePackage", "lucideTag",
  "lucideShirt", "lucideGlasses", "lucideWatch", "lucideSparkles", "lucideFlame",
  "lucideCoffee", "lucideWine", "lucideBeer", "lucidePizza", "lucideSandwich",
  "lucideSalad", "lucideIceCream", "lucideCake", "lucideApple", "lucideCarrot",
  "lucideCar", "lucidePlane", "lucideTrain", "lucideBike", "lucideBus",
  "lucideShip", "lucideRocket", "lucideFuel", "lucideMapPinned", "lucideCompass",
  "lucideHeart", "lucideHeartPulse", "lucideDumbbell", "lucidePill", "lucideStethoscope",
  "lucideActivity", "lucideBrain", "lucideEye", "lucideSmile", "lucideMoon",
  "lucideBook", "lucideBookOpen", "lucideMusic", "lucideHeadphones", "lucideFilm",
  "lucideTv", "lucideGamepad", "lucideGamepad2", "lucideCamera", "lucideImage",
  "lucidePalette", "lucideBrush", "lucideMic", "lucideRadio", "lucideTheater",
  "lucideTrophy", "lucideMedal", "lucideTarget", "lucideFlag",
  "lucideMountain", "lucideWaves", "lucideSnowflake", "lucideSun", "lucideZap",
  "lucideUser", "lucideUsers", "lucideUserPlus", "lucideBaby", "lucideGraduationCap",
  "lucideHandshake", "lucideMessageCircle", "lucideMessageSquare", "lucidePhone", "lucideMail",
  "lucideCode", "lucideCpu", "lucideDatabase", "lucideServer", "lucideCloud",
  "lucideWifi", "lucideBluetooth", "lucideUsb", "lucideHardDrive", "lucideSmartphone",
  "lucideTablet", "lucideAtom", "lucideMicroscope", "lucideTestTube", "lucideFlaskConical",
  "lucideDog", "lucideCat", "lucideBird", "lucideFish", "lucideRabbit",
  "lucideTrees", "lucideLeaf", "lucideSprout", "lucideBug", "lucideShell",
  "lucideStar", "lucideBookmark", "lucidePin", "lucideAnchor", "lucideShield",
  "lucideLock", "lucideGem", "lucideAward", "lucideLightbulb"
] as const;

/**
 * Mapping des noms de couleurs vers les classes utilitaires CSS
 * Utilisé pour styler les feuilles de catégories
 */
export const CategoryColors: Record<string, string> = {
  slate: "bg-slate-50 border-slate-200 text-slate-700",
  gray: "bg-gray-50 border-gray-200 text-gray-700",
  zinc: "bg-zinc-50 border-zinc-200 text-zinc-700",
  neutral: "bg-neutral-50 border-neutral-200 text-neutral-700",
  stone: "bg-stone-50 border-stone-200 text-stone-700",
  red: "bg-red-50 border-red-200 text-red-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
  amber: "bg-amber-50 border-amber-200 text-amber-800",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
  lime: "bg-lime-50 border-lime-200 text-lime-800",
  green: "bg-green-50 border-green-200 text-green-800",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  teal: "bg-teal-50 border-teal-200 text-teal-700",
  cyan: "bg-cyan-50 border-cyan-200 text-cyan-700",
  sky: "bg-sky-50 border-sky-200 text-sky-700",
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  violet: "bg-violet-50 border-violet-200 text-violet-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  fuchsia: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700",
  pink: "bg-pink-50 border-pink-200 text-pink-700",
  rose: "bg-rose-50 border-rose-200 text-rose-700",
};
