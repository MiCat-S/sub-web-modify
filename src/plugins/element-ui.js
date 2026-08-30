import Vue from 'vue'
import {
  Button,
  Card,
  Checkbox,
  Collapse,
  CollapseItem,
  Dialog,
  Form,
  FormItem,
  Input,
  Message,
  Option,
  OptionGroup,
  Select,
  Tooltip
} from 'element-ui'
import locale from 'element-ui/lib/locale'
import lang from 'element-ui/lib/locale/lang/zh-CN'

locale.use(lang)

const components = [
  Button,
  Card,
  Checkbox,
  Collapse,
  CollapseItem,
  Dialog,
  Form,
  FormItem,
  Input,
  Option,
  OptionGroup,
  Select,
  Tooltip
]

components.forEach(component => Vue.component(component.name, component))

Vue.prototype.$ELEMENT = { size: 'small' }
Vue.prototype.$message = Message
