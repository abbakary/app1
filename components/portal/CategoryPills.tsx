'use client';

import { motion } from 'framer-motion';
import { Utensils, Coffee, Pizza, IceCream, Beef, GlassWater } from 'lucide-react';

interface CategoryPillsProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
    all: Utensils,
    main: Beef,
    appetizer: Pizza,
    side: Coffee,
    beverage: GlassWater,
    dessert: IceCream,
};

export function CategoryPills({ categories, selectedCategory, onSelectCategory }: CategoryPillsProps) {
    return (
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-5 px-5">
            {categories.map((category) => {
                const isActive = selectedCategory === category;
                const Icon = CATEGORY_ICONS[category.toLowerCase()] || Utensils;

                return (
                    <button
                        key={category}
                        onClick={() => onSelectCategory(category)}
                        className="group relative flex flex-col items-center gap-2 min-w-[72px] outline-none"
                    >
                        <div
                            className={`
                w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300
                ${isActive
                                    ? 'bg-primary shadow-[0_8px_20px_rgba(255,107,0,0.3)] scale-110'
                                    : 'bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 group-active:scale-95'
                                }
              `}
                        >
                            <Icon
                                className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`}
                            />

                            {isActive && (
                                <motion.div
                                    layoutId="active-pill-bg"
                                    className="absolute inset-0 bg-primary rounded-3xl -z-10"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                        </div>

                        <span
                            className={`
                text-[11px] font-bold uppercase tracking-wider transition-colors duration-300
                ${isActive ? 'text-primary' : 'text-gray-400'}
              `}
                        >
                            {category}
                        </span>

                        {isActive && (
                            <motion.div
                                layoutId="active-dot"
                                className="w-1.5 h-1.5 bg-primary rounded-full mt-1 shadow-[0_0_8px_rgba(255,107,0,0.5)]"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
