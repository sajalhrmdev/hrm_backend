import { prisma } from "../lib/prisma.js";
const themes = [
    {
        name: "Default",
        slug: "default",
        primaryColor: "#4A3ADE",
        secondaryColor: "#6C63FF",
        backgroundColor: "#FFFFFF",
        surfaceColor: "#F5F5F5",
        textColor: "#1A1A2E",
        isDefault: true,
    },
    {
        name: "Dark",
        slug: "dark",
        primaryColor: "#BB86FC",
        secondaryColor: "#03DAC6",
        backgroundColor: "#121212",
        surfaceColor: "#1E1E1E",
        textColor: "#E1E1E1",
        isDefault: false,
    },
    {
        name: "Ocean",
        slug: "ocean",
        primaryColor: "#0077B6",
        secondaryColor: "#00B4D8",
        backgroundColor: "#F0F8FF",
        surfaceColor: "#CAF0F8",
        textColor: "#03045E",
        isDefault: false,
    },
    {
        name: "Forest",
        slug: "forest",
        primaryColor: "#2D6A4F",
        secondaryColor: "#52B788",
        backgroundColor: "#F8FFF8",
        surfaceColor: "#D8F3DC",
        textColor: "#081C15",
        isDefault: false,
    },
    {
        name: "Sunset",
        slug: "sunset",
        primaryColor: "#E36414",
        secondaryColor: "#FB8B24",
        backgroundColor: "#FFF8F0",
        surfaceColor: "#FEE3C8",
        textColor: "#3E1F00",
        isDefault: false,
    },
];
async function main() {
    console.log("Seeding mobile themes...");
    for (const theme of themes) {
        const existing = await prisma.mobileTheme.findUnique({ where: { slug: theme.slug } });
        if (existing) {
            console.log(`Theme "${theme.name}" already exists, skipping.`);
            continue;
        }
        await prisma.mobileTheme.create({ data: theme });
        console.log(`Created theme: ${theme.name}`);
    }
    console.log("Done!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
