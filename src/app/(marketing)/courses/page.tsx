import AlgoliaSearchPanel from "@/components/marketing/AlgoliaSearchPanel.client";

export const dynamic = 'force-dynamic';

export default function CoursesPage() {
    return (
        <div className="min-h-screen bg-[#f7f9fb] font-sans text-[#191c1e]">
            {/* The entire Search UI (including Hero) is now handled by the Algolia panel so the search bar works globally */}
            <AlgoliaSearchPanel />
        </div>
    );
}
