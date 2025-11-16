// Color psychology database

export interface ColorPsychologyData {
    emotion: string[]
    meaning: string
    use: string[]
}

export const colorPsychology: Record<string, ColorPsychologyData> = {
    red: {
        emotion: ['Passion', 'Energy', 'Danger', 'Love', 'Anger'],
        meaning: 'Mewakili kekuatan, gairah, dan intensitas. Dapat meningkatkan detak jantung dan menciptakan rasa urgensi.',
        use: ['Call-to-action buttons', 'Sales', 'Food industry', 'Warning signs']
    },
    orange: {
        emotion: ['Enthusiasm', 'Creativity', 'Warmth', 'Adventure'],
        meaning: 'Menggabungkan energi merah dengan kebahagiaan kuning. Mendorong optimisme dan spontanitas.',
        use: ['Entertainment', 'Food brands', 'Children products', 'Creative industries']
    },
    yellow: {
        emotion: ['Happiness', 'Optimism', 'Caution', 'Energy'],
        meaning: 'Warna paling terang yang menarik perhatian. Mewakili kebahagiaan, keceriaan, dan kreativitas.',
        use: ['Attention-grabbing', 'Food industry', 'Children products', 'Warning signs']
    },
    green: {
        emotion: ['Nature', 'Growth', 'Harmony', 'Balance', 'Health'],
        meaning: 'Mewakili alam, pertumbuhan, dan keseimbangan. Menenangkan dan menciptakan rasa aman.',
        use: ['Eco-friendly brands', 'Healthcare', 'Finance', 'Nature products']
    },
    blue: {
        emotion: ['Trust', 'Calm', 'Stability', 'Professionalism', 'Security'],
        meaning: 'Warna yang paling dipercaya. Mewakili ketenangan, kepercayaan, dan profesionalisme.',
        use: ['Corporate brands', 'Technology', 'Healthcare', 'Finance', 'Social media']
    },
    purple: {
        emotion: ['Luxury', 'Creativity', 'Mystery', 'Spirituality', 'Wisdom'],
        meaning: 'Menggabungkan stabilitas biru dengan energi merah. Mewakili kemewahan dan kreativitas.',
        use: ['Luxury brands', 'Beauty products', 'Creative industries', 'Spiritual products']
    },
    pink: {
        emotion: ['Femininity', 'Compassion', 'Love', 'Gentleness'],
        meaning: 'Mewakili kasih sayang, kelembutan, dan femininitas. Menenangkan dan menciptakan rasa nyaman.',
        use: ['Beauty products', 'Fashion', 'Children products', 'Romantic brands']
    },
    brown: {
        emotion: ['Stability', 'Reliability', 'Earthiness', 'Comfort'],
        meaning: 'Mewakili keandalan, kestabilan, dan koneksi dengan alam. Menciptakan rasa nyaman dan aman.',
        use: ['Food industry', 'Natural products', 'Furniture', 'Outdoor brands']
    },
    black: {
        emotion: ['Power', 'Elegance', 'Sophistication', 'Mystery'],
        meaning: 'Mewakili kekuatan, kemewahan, dan kecanggihan. Menciptakan kontras dan fokus.',
        use: ['Luxury brands', 'Fashion', 'Technology', 'Premium products']
    },
    white: {
        emotion: ['Purity', 'Simplicity', 'Cleanliness', 'Minimalism'],
        meaning: 'Mewakili kesederhanaan, kemurnian, dan kebersihan. Menciptakan ruang dan kejelasan.',
        use: ['Healthcare', 'Technology', 'Minimalist design', 'Clean brands']
    },
    gray: {
        emotion: ['Neutrality', 'Balance', 'Sophistication', 'Formality'],
        meaning: 'Mewakili netralitas dan keseimbangan. Menciptakan rasa profesional dan modern.',
        use: ['Corporate brands', 'Technology', 'Architecture', 'Professional services']
    }
}

export function getColorName(
    r: number,
    g: number,
    b: number,
    rgbToHsl: (r: number, g: number, b: number) => { h: number; s: number; l: number }
): string {
    const hsl = rgbToHsl(r, g, b)

    // Determine color category
    if (hsl.l < 0.2) return 'black'
    if (hsl.l > 0.9) return 'white'
    if (hsl.s < 0.2) return 'gray'

    if (hsl.h < 15 || hsl.h > 345) return 'red'
    if (hsl.h >= 15 && hsl.h < 45) return 'orange'
    if (hsl.h >= 45 && hsl.h < 75) return 'yellow'
    if (hsl.h >= 75 && hsl.h < 165) return 'green'
    if (hsl.h >= 165 && hsl.h < 255) return 'blue'
    if (hsl.h >= 255 && hsl.h < 285) return 'purple'
    if (hsl.h >= 285 && hsl.h < 345) return 'pink'

    return 'gray'
}

