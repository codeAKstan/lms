import { getHero, getActiveFocusAreas } from "@/actions/admin/homepage";
import { getActiveFAQs } from "@/actions/admin/faq";
import ClientPage from "./ClientPage";

export const revalidate = 60; // Revalidate public cache every 60s for high performance

export default async function MarketingHomePage() {
    const [heroRes, focusRes, faqRes] = await Promise.all([
        getHero(),
        getActiveFocusAreas(),
        getActiveFAQs()
    ]);

    return (
        <ClientPage 
            heroData={heroRes.success ? heroRes.data || null : null} 
            focusAreasData={focusRes.success && focusRes.data ? focusRes.data : []}
            faqsData={faqRes.success && faqRes.data ? faqRes.data : []}
        />
    );
}
