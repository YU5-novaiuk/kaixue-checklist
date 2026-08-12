import * as Icons from 'lucide-react'
import { LucideProps } from 'lucide-react'
export function DynamicIcon({name,...props}:LucideProps&{name:string}){const Icon=(Icons as unknown as Record<string,React.ComponentType<LucideProps>>)[name]||Icons.Circle;return <Icon {...props}/>}
