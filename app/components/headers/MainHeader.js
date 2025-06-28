import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMeteor, faCompass, faFeatherPointed } from "@fortawesome/free-solid-svg-icons";

import { merriweather } from '../../lib/fonts';

export default function MainHeader() {
    const pathname = usePathname();

    return (
        <header className={`mainHeader ${merriweather.className}`}>
            <h3><FontAwesomeIcon icon={faMeteor}/> AI Adventure</h3>

            <nav>
                <ul>
                    <li className={pathname === "/" ? "active" : ""}>
                        <Link href="/">
                            <FontAwesomeIcon icon={faCompass}/> Discover
                        </Link>
                    </li>
                    <li className={pathname === "/create" ? "active" : ""}>
                        <Link href="/create">
                            <FontAwesomeIcon icon={faFeatherPointed}/> Create
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}