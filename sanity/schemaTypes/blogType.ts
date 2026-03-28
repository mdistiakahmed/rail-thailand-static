import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const blogType = defineType({
  name: "blog",
  title: "Blog",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
      },
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility',
          validation: Rule => Rule.required()
        }
      ],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: "category",
      type: "reference",
      to: { type: "category" },
      title: "Category",
      validation: (Rule) =>
        Rule.required().error("A category must be selected."),
    }),
    defineField({
      name: "station",
      title: "Station or City",
      type: "string",
    }),
    {
      name: "lesson",
      type: "number",
    },
    defineField({
      name: "publishedAt",
      type: "datetime",
    }),
    defineField({
      name: "body",
      type: "blockContent",
    }),
    defineField({
      name: "excerpt",
      type: "text",
      title: "Excerpt",
      validation: (Rule) =>
        Rule.max(200).warning("Excerpt should be 200 characters or fewer."),
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage"
    },
    prepare(selection) {
      return { ...selection };
    },
  },
});
