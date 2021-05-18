import WorkPlace from "../pages/work-place"
import { Route } from "react-router-dom"
import { FC } from "react"

const routes = [
  {
    path: "/",
    components: WorkPlace
  },
  {
    path: "/work-place",
    components: WorkPlace
  }
]

const Router: FC = () => {

  return <>
    { routes.map((route, i) => {
      return (
        <Route key={ i } path={ route.path } component={ route.components }></Route>
      )
    }) }
  </>
}

export default Router
