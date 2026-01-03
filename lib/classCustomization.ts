export const CLASS_ICONS = [
  { id: "book", name: "Book", component: "BookOpen" },
  { id: "calculator", name: "Calculator", component: "Calculator" },
  { id: "beaker", name: "Beaker", component: "Beaker" },
  { id: "atom", name: "Atom", component: "Atom" },
  { id: "palette", name: "Palette", component: "Palette" },
  { id: "music", name: "Music", component: "Music" },
  { id: "globe", name: "Globe", component: "Globe" },
  { id: "code", name: "Code", component: "Code" },
  { id: "cpu", name: "CPU", component: "Cpu" },
  { id: "dumbbell", name: "Dumbbell", component: "Dumbbell" },
  { id: "heart", name: "Heart", component: "Heart" },
  { id: "star", name: "Star", component: "Star" },
] as const;

export const CLASS_COLORS = [
  { id: "pink", name: "Pink", gradient: "from-pink-500 to-pink-600", border: "border-pink-200", bg: "bg-pink-50" },
  { id: "purple", name: "Purple", gradient: "from-purple-500 to-purple-600", border: "border-purple-200", bg: "bg-purple-50" },
  { id: "blue", name: "Blue", gradient: "from-blue-500 to-blue-600", border: "border-blue-200", bg: "bg-blue-50" },
  { id: "green", name: "Green", gradient: "from-green-500 to-green-600", border: "border-green-200", bg: "bg-green-50" },
  { id: "yellow", name: "Yellow", gradient: "from-yellow-500 to-yellow-600", border: "border-yellow-200", bg: "bg-yellow-50" },
  { id: "orange", name: "Orange", gradient: "from-orange-500 to-orange-600", border: "border-orange-200", bg: "bg-orange-50" },
  { id: "red", name: "Red", gradient: "from-red-500 to-red-600", border: "border-red-200", bg: "bg-red-50" },
  { id: "indigo", name: "Indigo", gradient: "from-indigo-500 to-indigo-600", border: "border-indigo-200", bg: "bg-indigo-50" },
  { id: "teal", name: "Teal", gradient: "from-teal-500 to-teal-600", border: "border-teal-200", bg: "bg-teal-50" },
  { id: "cyan", name: "Cyan", gradient: "from-cyan-500 to-cyan-600", border: "border-cyan-200", bg: "bg-cyan-50" },
] as const;

export const CLASS_BANNERS = [
  { id: "gradient-1", name: "Pink & Purple", gradient: "from-pink-500 via-purple-500 to-blue-500" },
  { id: "gradient-2", name: "Blue & Teal", gradient: "from-blue-500 via-teal-500 to-green-500" },
  { id: "gradient-3", name: "Orange & Red", gradient: "from-orange-500 via-red-500 to-pink-500" },
  { id: "gradient-4", name: "Purple & Indigo", gradient: "from-purple-500 via-indigo-500 to-blue-500" },
  { id: "gradient-5", name: "Green & Yellow", gradient: "from-green-500 via-yellow-500 to-orange-500" },
  { id: "gradient-6", name: "Cyan & Blue", gradient: "from-cyan-500 via-blue-500 to-indigo-500" },
  { id: "gradient-7", name: "Pink & Orange", gradient: "from-pink-500 via-orange-500 to-yellow-500" },
  { id: "gradient-8", name: "Teal & Purple", gradient: "from-teal-500 via-blue-500 to-purple-500" },
] as const;

export function getClassColor(colorId?: string) {
  return CLASS_COLORS.find(c => c.id === colorId) || CLASS_COLORS[0];
}

export function getClassBanner(bannerId?: string) {
  return CLASS_BANNERS.find(b => b.id === bannerId) || CLASS_BANNERS[0];
}

export function getClassIconName(iconId?: string) {
  return CLASS_ICONS.find(i => i.id === iconId)?.component || "BookOpen";
}
