import { log } from './logs';

export enum TOP_CATEGORIES {
  ART = "Art",
  BUSINESS = "Business",
  CRAFTS = 'Crafts',
  COMPUTERS = "Computers",
  COOKING = "Cooking",
  FICTION = "Fiction",
  HEALTH = 'Health',
  HUMOR = 'Humor',
  MATH_AND_SCIENCE = 'Math-and-Science',
  NON_FICTION = 'Non-fiction',
  POETRY = 'Poetry',
  SELF_HELP = 'Self-Help',
  TRAVEL = 'Travel',
  GARDENING = 'Gardening',
  OTHER = 'Other',
  UNKNOWN = 'unknown'
}

const categoryLookup: Record<string, TOP_CATEGORIES> = {
  "True Crime": TOP_CATEGORIES.FICTION,
  "Music": TOP_CATEGORIES.ART,
  "Self-Help": TOP_CATEGORIES.SELF_HELP,
  "Fiction": TOP_CATEGORIES.FICTION,
  "Political Science": TOP_CATEGORIES.NON_FICTION,
  "Crafts & Hobbies": TOP_CATEGORIES.CRAFTS,
  "Biography & Autobiography": TOP_CATEGORIES.NON_FICTION,
  "Social Science": TOP_CATEGORIES.NON_FICTION,
  "Computers": TOP_CATEGORIES.COMPUTERS,
  "Psychology": TOP_CATEGORIES.NON_FICTION,
  "Science fiction": TOP_CATEGORIES.FICTION,
  "Business & Economics": TOP_CATEGORIES.BUSINESS,
  "Medical": TOP_CATEGORIES.HEALTH,
  "Family & Relationships": TOP_CATEGORIES.SELF_HELP,
  "Gardening": TOP_CATEGORIES.GARDENING,
  "Cooking": TOP_CATEGORIES.COOKING,
  "Body, Mind & Spirit": TOP_CATEGORIES.SELF_HELP,
  "Health & Fitness": TOP_CATEGORIES.HEALTH,
  "Performing Arts": TOP_CATEGORIES.ART,
  "Artificial intelligence": TOP_CATEGORIES.COMPUTERS,
  "Authors, American": TOP_CATEGORIES.FICTION,
  "Literary Collections": TOP_CATEGORIES.FICTION,
  "Juvenile Nonfiction": TOP_CATEGORIES.FICTION,
  "History": TOP_CATEGORIES.NON_FICTION,
  "Sports & Recreation": TOP_CATEGORIES.HEALTH,
  "Mathematics": TOP_CATEGORIES.MATH_AND_SCIENCE,
  "FICTION": TOP_CATEGORIES.FICTION,
  "Science": TOP_CATEGORIES.MATH_AND_SCIENCE,
  "House & Home": TOP_CATEGORIES.OTHER,
  "Juvenile Fiction": TOP_CATEGORIES.FICTION,
  "Computer crimes": TOP_CATEGORIES.COMPUTERS,
  "Nature": TOP_CATEGORIES.NON_FICTION,
  "Games & Activities": TOP_CATEGORIES.OTHER,
  "African Americans": TOP_CATEGORIES.NON_FICTION,
  "Asperger's syndrome": TOP_CATEGORIES.OTHER,
  "Anxiety disorders": TOP_CATEGORIES.ART,
  "Religion": TOP_CATEGORIES.OTHER,
  "Young Adult Nonfiction": TOP_CATEGORIES.FICTION,
  "Travel": TOP_CATEGORIES.TRAVEL,
  "Imaginary wars and battles": TOP_CATEGORIES.FICTION,
  "Humor": TOP_CATEGORIES.HUMOR,
  "Language Arts & Disciplines": TOP_CATEGORIES.NON_FICTION,
  "Technology & Engineering": TOP_CATEGORIES.COMPUTERS,
  "BUSINESS & ECONOMICS": TOP_CATEGORIES.BUSINESS,
  "Young Adult Fiction": TOP_CATEGORIES.FICTION,
  "Philosophy": TOP_CATEGORIES.NON_FICTION,
  "Coding theory": TOP_CATEGORIES.COMPUTERS,
  "Low-fat diet": TOP_CATEGORIES.COOKING,
  "Japan": TOP_CATEGORIES.TRAVEL,
  "Education": TOP_CATEGORIES.NON_FICTION,
  "Wilderness survival": TOP_CATEGORIES.NON_FICTION,
  "Cookbooks": TOP_CATEGORIES.COOKING,
  "Electronic books": TOP_CATEGORIES.COMPUTERS,
  "Astronauts": TOP_CATEGORIES.OTHER,
  "Reference": TOP_CATEGORIES.OTHER,
  "Poetry": TOP_CATEGORIES.POETRY,
  "Farm life": TOP_CATEGORIES.NON_FICTION,
  "Cooking (Greens)": TOP_CATEGORIES.COOKING,
  "Suicide": TOP_CATEGORIES.NON_FICTION,
  "Art": TOP_CATEGORIES.ART,
  "Computer security": TOP_CATEGORIES.COMPUTERS,
  "Emigration and immigration": TOP_CATEGORIES.NON_FICTION,
  "Law": TOP_CATEGORIES.NON_FICTION,
  "Comics & Graphic Novels": TOP_CATEGORIES.ART,
  "Electronic instruments": TOP_CATEGORIES.COMPUTERS,
  "Design": TOP_CATEGORIES.ART,
  "Chemical industry": TOP_CATEGORIES.NON_FICTION,
  "Architecture": TOP_CATEGORIES.ART,
  "Literary Criticism": TOP_CATEGORIES.NON_FICTION,
  "France": TOP_CATEGORIES.TRAVEL,
  "Interstellar travel": TOP_CATEGORIES.MATH_AND_SCIENCE,
  "Computer architecture": TOP_CATEGORIES.COMPUTERS,
  "Suspense fiction": TOP_CATEGORIES.FICTION,
  "Electric power failures": TOP_CATEGORIES.NON_FICTION,
  "Short stories": TOP_CATEGORIES.FICTION,
  "Assisted suicide": TOP_CATEGORIES.NON_FICTION,
  "Acting": TOP_CATEGORIES.ART,
  "Code and cipher stories": TOP_CATEGORIES.COMPUTERS,
  "Data mining": TOP_CATEGORIES.COMPUTERS,
  "Curiosities and wonders": TOP_CATEGORIES.OTHER
}


export const findMatchingCategory = (categories: string[]):TOP_CATEGORIES => {
  const category = categories.find(x => categoryLookup[x]) as TOP_CATEGORIES | undefined;

  if (!category) {
    log(`ERROR: Unable to find category in ${categories.join(', ')}`)

    return TOP_CATEGORIES.UNKNOWN
  }

  return categoryLookup[category]
} 

export const isTopCategory = (value: string): value is TOP_CATEGORIES => {
  return Object.values(TOP_CATEGORIES).includes(value as TOP_CATEGORIES);
}

