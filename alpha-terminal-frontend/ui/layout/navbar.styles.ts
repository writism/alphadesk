export const navbarStyles = {
    nav: "sticky top-0 z-50 bg-gray-900 text-white px-4 py-2.5 shadow-md md:px-6 md:py-3",
    navInner: "flex w-full min-w-0 items-center justify-between gap-3",
    logo: "shrink-0 text-base font-bold tracking-tight hover:text-yellow-300 transition-colors break-keep md:text-xl",
    menuList: "hidden min-w-0 items-center gap-4 md:flex lg:gap-6",
    menuItem: {
        base: "text-sm font-medium transition-colors",
        active: "text-yellow-300 font-semibold",
        inactive: "text-gray-300 hover:text-white",
    },
    drawerLink: "block rounded-md px-3 py-3 text-base font-medium transition-colors",
    loginButton:
        "inline-flex shrink-0 items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors md:py-1.5",
    logoutButton:
        "inline-flex shrink-0 items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-700 transition-colors md:py-1.5",
    iconButton:
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-gray-100 hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400",
    overlay: "fixed inset-0 z-[60] bg-black/60 md:hidden",
    drawer:
        "fixed inset-y-0 right-0 z-[70] flex w-[min(100%,18rem)] flex-col border-l border-gray-700 bg-gray-900 shadow-xl md:hidden",
    drawerHeader: "flex items-center justify-between border-b border-gray-700 px-4 py-3",
    drawerBody: "flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4",
    drawerFooter: "mt-auto border-t border-gray-700 px-3 py-4",
} as const
