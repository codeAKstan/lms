/**
 * Returns the appropriate dashboard URL based on user role.
 */
export function getDashboardByRole(role: string): string {
    switch (role) {
        case "ADMIN":
            return "/admin/dashboard";
        case "INSTRUCTOR":
            return "/instructor/dashboard";
        default:
            return "/student/courses";
    }
}
