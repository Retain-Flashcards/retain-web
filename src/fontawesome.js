import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    faBold, 
    faItalic,
    faStrikethrough,
    faHeading,
    faUnderline,
    faListOl,
    faListUl,
    faLink,
    faImage,
    faSuperscript,
    faSubscript,
    faAdd,
    faPlusMinus,
    faRefresh,
    faGear,
    faStopwatch,
    faWandMagicSparkles,
    faArrowRight,
    faPaperPlane
} from '@fortawesome/free-solid-svg-icons'

import {
    faAlarmClock
} from '@fortawesome/free-regular-svg-icons'

library.add(faBold, faPaperPlane, faArrowRight, faAlarmClock, faWandMagicSparkles, faGear, faStopwatch, faItalic, faStrikethrough, faHeading, faUnderline, faListUl, faListOl, faLink, faImage, faSuperscript, faSubscript, faAdd, faPlusMinus, faRefresh)

export default function registerFaIcons(app) {
    app.component('font-awesome-icon', FontAwesomeIcon)
}