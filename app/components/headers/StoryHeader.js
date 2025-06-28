import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMeteor, faGear, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";

import { merriweather } from '../../lib/fonts';

export default function StoryHeader({ title, onSettingsClick, settingsOpen }) {
    return (
        <header className={merriweather.className} >
            <h3><FontAwesomeIcon icon={faMeteor}/> {title}</h3>

            {!settingsOpen && (
                <div className="headerButtons">
                    {/*<button className="settingsButton" onClick={() => console.log('Save adventure')}>
                        <FontAwesomeIcon icon={faFloppyDisk} />
                    </button>*/}
                    <button className="settingsButton" onClick={onSettingsClick}>
                        <FontAwesomeIcon icon={faGear} />
                    </button>
                </div>
            )}
        </header>
    );
}