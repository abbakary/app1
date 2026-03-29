'use client';

import { MenuItem } from '@/types/menu'; // Assuming types exist or will be added
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ChefHat } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/** Ensures image paths that come from the backend (starting with /) are absolute. */
function resolveImageUrl(url?: string): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('/')) {
        return `${BASE_URL}${url}`;
    }
    return url;
}

interface MenuCardProps {
    item: {
        id: string;
        name: string;
        price: number;
        description?: string;
        image_url?: string;
    };
    onAdd: (item: any) => void;
}

export function MenuCard({ item, onAdd }: MenuCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="premium-card overflow-hidden group active:scale-[0.98] transition-all duration-300">
                <CardContent className="p-0 flex flex-row h-36">
                    {/* Item Image */}
                    <div className="relative w-36 h-full bg-gray-50 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                        {item.image_url ? (
                            <Image
                                src={resolveImageUrl(item.image_url)!}
                                alt={item.name}
                                fill
                                sizes="144px"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                <ChefHat className="w-8 h-8 text-primary/20" />
                            </div>
                        )}

                        {/* Price Badge Over Image */}
                        <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-lg shadow-sm">
                            <span className="text-[12px] font-black text-primary">TSH {item.price.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-[16px] leading-tight truncate group-hover:text-primary transition-colors">
                                {item.name}
                            </h3>
                            {item.description && (
                                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                    {item.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end">
                            <Button
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAdd(item);
                                }}
                                className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-10 w-10 shadow-lg shadow-primary/20 active:scale-90 transition-all hover:rotate-90"
                            >
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
