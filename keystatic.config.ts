import { config, collection, singleton, fields } from "@keystatic/core";

/**
 * Content model for amrsamir.me
 *
 * Edit content at /keystatic (run `npm run dev`, then open http://127.0.0.1:3000/keystatic).
 * Once GitHub mode is configured (see README), the same editor works on the live site
 * and every save becomes a commit that Vercel redeploys automatically.
 */

const TRACKS = [
  { label: "Events & project management", value: "events" },
  { label: "Marketing & digital", value: "marketing" },
  { label: "Tech & AI", value: "tech" },
] as const;

const storage =
  process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github"
    ? ({
        kind: "github",
        repo: {
          owner: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_OWNER ?? "Amrsamiredris",
          name: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO ?? "amrsamir-os",
        },
      } as const)
    : ({ kind: "local" } as const);

/** Shared schema for the three "doors" (Events, Marketing, Tech). */
const doorSchema = (label: string) => ({
  label,
  path: `content/doors/${label.toLowerCase()}`,
  format: { data: "yaml" as const },
  schema: {
    title: fields.text({ label: "Window title", validation: { isRequired: true } }),
    tagline: fields.text({
      label: "Tagline",
      description: "One line under the title. Also used as the LinkedIn preview text.",
      validation: { isRequired: true },
    }),
    intro: fields.text({ label: "Intro paragraph", multiline: true }),
    capabilities: fields.array(fields.text({ label: "Capability" }), {
      label: "What I do here",
      itemLabel: (p) => p.value || "Capability",
    }),
    cvSummary: fields.text({
      label: "CV summary (shown at the top of this track's CV)",
      multiline: true,
    }),
    cvPdf: fields.file({
      label: "CV PDF for this track",
      directory: "public/files/cv",
      publicPath: "/files/cv/",
    }),
  },
});

export default config({
  storage,
  ui: {
    brand: { name: "amrsamir.me" },
    navigation: {
      Site: ["site", "doorEvents", "doorMarketing", "doorTech"],
      Work: ["projects", "lab", "films"],
      CV: ["experience", "cvExtras"],
    },
  },
  singletons: {
    site: singleton({
      label: "Site & contact",
      path: "content/site",
      format: { data: "yaml" },
      schema: {
        name: fields.text({ label: "Name", validation: { isRequired: true } }),
        headline: fields.text({
          label: "Headline",
          description: "One sentence that covers all three tracks.",
          validation: { isRequired: true },
        }),
        about: fields.text({ label: "Short bio", multiline: true }),
        location: fields.text({ label: "Location" }),
        languages: fields.text({ label: "Languages" }),
        availability: fields.text({
          label: "Availability status",
          description: "Shown in the menu bar, e.g. 'Open to projects'.",
        }),
        now: fields.text({
          label: "Now (what you're working on)",
          multiline: true,
        }),
        email: fields.text({ label: "Email" }),
        phone: fields.text({ label: "Phone" }),
        linkedin: fields.url({ label: "LinkedIn URL" }),
        portrait: fields.image({
          label: "Portrait",
          directory: "public/images/site",
          publicPath: "/images/site/",
        }),
      },
    }),
    doorEvents: singleton(doorSchema("Events")),
    doorMarketing: singleton(doorSchema("Marketing")),
    doorTech: singleton(doorSchema("Tech")),
    cvExtras: singleton({
      label: "Education, certifications, skills",
      path: "content/cv-extras",
      format: { data: "yaml" },
      schema: {
        education: fields.array(
          fields.object({
            degree: fields.text({ label: "Degree" }),
            school: fields.text({ label: "School" }),
            year: fields.text({ label: "Year" }),
          }),
          { label: "Education", itemLabel: (p) => p.fields.degree.value || "Education" },
        ),
        certifications: fields.array(
          fields.object({
            name: fields.text({ label: "Certification" }),
            issuer: fields.text({ label: "Issuer" }),
            status: fields.select({
              label: "Status",
              options: [
                { label: "Completed", value: "completed" },
                { label: "In progress", value: "in-progress" },
              ],
              defaultValue: "completed",
            }),
          }),
          { label: "Certifications", itemLabel: (p) => p.fields.name.value || "Certification" },
        ),
        skills: fields.array(
          fields.object({
            name: fields.text({ label: "Skill" }),
            tracks: fields.multiselect({ label: "Show on", options: TRACKS }),
          }),
          { label: "Skills", itemLabel: (p) => p.fields.name.value || "Skill" },
        ),
      },
    }),
  },
  collections: {
    projects: collection({
      label: "Projects (work)",
      slugField: "title",
      path: "content/projects/*",
      format: { contentField: "body" },
      columns: ["title", "year"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        tracks: fields.multiselect({
          label: "Tracks",
          description: "Which doors show this project. A project can sit behind more than one.",
          options: TRACKS,
        }),
        featured: fields.checkbox({ label: "Featured on the desktop", defaultValue: false }),
        year: fields.text({ label: "Year" }),
        client: fields.text({ label: "Client / organisation" }),
        role: fields.text({ label: "My role" }),
        location: fields.text({ label: "Location" }),
        summary: fields.text({ label: "One-line summary", multiline: true }),
        facts: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            value: fields.text({ label: "Value" }),
          }),
          {
            label: "Key facts",
            description: "Only verifiable numbers. Leave empty rather than estimate.",
            itemLabel: (p) => `${p.fields.label.value}: ${p.fields.value.value}`,
          },
        ),
        cover: fields.image({
          label: "Cover image",
          directory: "public/images/projects",
          publicPath: "/images/projects/",
        }),
        body: fields.markdoc({ label: "Case study" }),
      },
    }),
    experience: collection({
      label: "Experience (CV)",
      slugField: "role",
      path: "content/experience/*",
      format: { data: "yaml" },
      columns: ["role", "organisation"],
      schema: {
        role: fields.slug({ name: { label: "Role" } }),
        organisation: fields.text({ label: "Organisation" }),
        location: fields.text({ label: "Location" }),
        start: fields.text({ label: "Start (e.g. 2022-06)" }),
        end: fields.text({ label: "End (e.g. 2024-09, or 'Present')" }),
        tracks: fields.multiselect({ label: "Show on CV for", options: TRACKS }),
        highlights: fields.array(fields.text({ label: "Highlight", multiline: true }), {
          label: "Highlights",
          itemLabel: (p) => p.value.slice(0, 60) || "Highlight",
        }),
      },
    }),
    lab: collection({
      label: "Lab (side projects & apps)",
      slugField: "title",
      path: "content/lab/*",
      format: { contentField: "body" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        kind: fields.select({
          label: "Kind",
          options: [
            { label: "App", value: "app" },
            { label: "Experiment", value: "experiment" },
            { label: "Writing", value: "writing" },
          ],
          defaultValue: "app",
        }),
        status: fields.select({
          label: "Status",
          options: [
            { label: "Live", value: "live" },
            { label: "In progress", value: "wip" },
            { label: "Archived", value: "archived" },
          ],
          defaultValue: "wip",
        }),
        url: fields.url({
          label: "Link",
          description: "External link or subdomain, e.g. https://spraywall.amrsamir.me",
        }),
        summary: fields.text({ label: "One-line summary", multiline: true }),
        cover: fields.image({
          label: "Cover image",
          directory: "public/images/lab",
          publicPath: "/images/lab/",
        }),
        body: fields.markdoc({ label: "Write-up" }),
      },
    }),
    films: collection({
      label: "Film",
      slugField: "title",
      path: "content/films/*",
      format: { contentField: "body" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        year: fields.text({ label: "Year" }),
        role: fields.text({ label: "My role" }),
        videoUrl: fields.url({
          label: "Video URL",
          description: "YouTube or Vimeo link.",
        }),
        summary: fields.text({ label: "One-line summary", multiline: true }),
        cover: fields.image({
          label: "Poster image",
          directory: "public/images/films",
          publicPath: "/images/films/",
        }),
        body: fields.markdoc({ label: "Notes" }),
      },
    }),
  },
});
