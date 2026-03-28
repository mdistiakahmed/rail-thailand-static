import { type SchemaTypeDefinition } from 'sanity'
import { blogType } from './blogType'
import { categoryType } from './categoryType'
import { blockContentType } from './blockContentType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [categoryType, blockContentType, blogType],
}
