import Widgets from "../render/WidgetsCenter"
import Text from "../widgets/text"
import Rectangle from "./rectangle"
import NotFound from "./not-found"

const widgets = new Widgets()
widgets.use(Text)
widgets.use(Rectangle)
widgets.use(NotFound)

export default widgets