import Widgets from "../render/WidgetsCenter"
import Text from "../widgets/text"
import NotFound from "../widgets/not-found"
import Rectangle from "./rectangle"

const widgets = new Widgets()
widgets.use(Text)
widgets.use(NotFound)
widgets.use(Rectangle)

export default widgets