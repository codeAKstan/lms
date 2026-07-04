import { Course } from "@/types/models";
import Link from "next/link";
import Image from "next/image";
import { Star, Clock, BookOpen, Check } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";

interface CourseCardProps {
    course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
    // Helper to format currency
    const formatPrice = (amount: number, currency: string) => {
        const formatter = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency || 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
        return formatter.format(amount); // Amount is in Naira (not kobo/cents)
    };

    // Calculate discount percentage if original price exists
    const discountPercentage = course.originalPrice
        ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
        : 0;

    return (
        <Link href={`/courses/${course.slug}`}>
            <Card className="group flex flex-col h-full overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-muted">
                {/* Thumbnail Section */}
                <div className="relative h-48 bg-surface overflow-hidden">
                    {/* Badges Overlay */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-20 items-end">
                        {course.bestseller && (
                            <Badge className="bg-amber-500 text-white shadow-md border-none font-bold">
                                🏆 Bestseller
                            </Badge>
                        )}
                        {course.trending && (
                            <Badge variant="warning" className="bg-secondary text-accent shadow-md border-none font-bold">
                                🔥 Trending
                            </Badge>
                        )}
                        {course.featured && !course.trending && !course.bestseller && (
                            <Badge variant="warning" className="bg-secondary text-accent shadow-md border-none">
                                Featured
                            </Badge>
                        )}
                    </div>

                    {/* Difficulty Badge (Bottom Left) */}
                    {course.difficulty && (
                        <div className="absolute bottom-3 left-3 z-20">
                            <Badge
                                variant="default"
                                className="bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm border-none hover:bg-white"
                            >
                                {course.difficulty}
                            </Badge>
                        </div>
                    )}

                    {course.thumbnail ? (
                        <div className="w-full h-full relative">
                            <Image
                                src={course.thumbnail}
                                alt={course.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Overlay for text readability if needed */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                    ) : (
                        <div className="w-full h-full relative bg-gray-100 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-deep-tech opacity-20"></div>
                            <span className="text-6xl relative z-10 animate-pulse">
                                {course.category === "Technology" && "💻"}
                                {course.category === "Sustainability" && "🌱"}
                                {course.category === "Innovation" && "💡"}
                                {course.category === "Energy" && "⚡"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow">
                    {/* Category */}
                    <div className="mb-3">
                        <Badge
                            className={`text-xs font-semibold px-2 py-0.5 text-white border-none ${course.category === "Technology" ? "bg-primary" :
                                course.category === "Sustainability" ? "bg-success" :
                                    course.category === "Innovation" ? "bg-accent" :
                                        "bg-secondary text-accent"
                                }`}
                        >
                            {course.category}
                        </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-accent mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
                        {course.title}
                    </h3>

                    {/* Instructor */}
                    {course.instructor && (
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200">
                                {course.instructor.avatar ? (
                                    <Image
                                        src={course.instructor.avatar}
                                        alt={course.instructor.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary text-white text-xs font-bold">
                                        {course.instructor.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <span className="text-sm text-muted-foreground font-medium line-clamp-1">
                                {course.instructor.name}
                            </span>
                        </div>
                    )}

                    {/* Meta Stats Row */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 py-2 border-y border-gray-50">
                        <div className="flex items-center gap-1 font-medium text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{course.rating.toFixed(1)}</span>
                            <span className="text-gray-400 font-normal">({course.studentCount})</span>
                        </div>

                        {(course.totalHours || 0) > 0 && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{course.totalHours}h</span>
                            </div>
                        )}

                        {(course.lectures || 0) > 0 && (
                            <div className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>{course.lectures} lec</span>
                            </div>
                        )}
                    </div>

                    {/* Learning Outcomes (Preview) */}
                    {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                        <div className="mb-4 space-y-1">
                            {course.learningOutcomes.slice(0, 2).map((outcome, idx) => (
                                <div key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground/90">
                                    <Check className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-1">{outcome}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-auto pt-3 flex items-end justify-between">
                        {/* Price Section */}
                        <div className="flex flex-col">
                            {course.originalPrice && course.originalPrice > course.price && (
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs text-muted-foreground line-through decoration-gray-400">
                                        {formatPrice(course.originalPrice, course.currency)}
                                    </span>
                                    <Badge variant="danger" className="text-[10px] h-4 px-1 rounded bg-red-100 text-red-600 border-red-200">
                                        -{discountPercentage}%
                                    </Badge>
                                </div>
                            )}
                            <div className="text-xl font-bold text-accent">
                                {course.price === 0 ? "Free" : formatPrice(course.price, course.currency)}
                            </div>
                        </div>

                        {/* Action Button (Hidden by default, shown on hover/focus) */}
                        <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto font-semibold">
                            Details <span className="ml-1">→</span>
                        </Button>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
