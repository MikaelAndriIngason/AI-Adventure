import { PT_Serif, Merriweather} from 'next/font/google';

export const PTSerifFont = PT_Serif({
    subsets: ['latin'],
    weight: ["400","700"],
})

export const merriweather = Merriweather({
    subsets: ['latin'],
    weight: ["400", "700"],
    style: ["normal", "italic"],
});