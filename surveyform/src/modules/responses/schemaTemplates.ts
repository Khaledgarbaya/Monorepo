import countriesOptions from "../countriesOptions";
import Bracket from "~/core/components/forms/Bracket";
import { makeAutocomplete } from "@vulcanjs/graphql";
import { Help } from "~/core/components/forms/Help";
import { FieldTemplateId, ParsedQuestion } from "~/surveys";
import RaceEthnicity from "~/core/components/forms/RaceEthnicity";
import Email2 from "~/core/components/forms/Email2";
import Hidden from "~/core/components/forms/Hidden";

export const templates: {
  [templateName in FieldTemplateId]: (
    questionObject: any
  ) => // TODO: is this type VulcanGraphqlFieldSchema or smth intermediate like "QuestionObject"?
  Partial<ParsedQuestion>;
} = {
  feature: () => ({
    input: "radiogroup",
    suffix: "experience",
    options: [
      {
        value: "never_heard",
        intlId: "options.features.never_heard",
      },
      { value: "heard", intlId: "options.features.heard" },
      { value: "used", intlId: "options.features.used" },
    ],
  }),
  pattern: () => ({
    input: "radiogroup",
    suffix: "experience",
    options: [
      { value: "use_never", intlId: "options.patterns.use_never" },
      { value: "use_sparingly", intlId: "options.patterns.use_sparingly" },
      { value: "use_neutral", intlId: "options.patterns.use_neutral" },
      { value: "use_frequently", intlId: "options.patterns.use_frequently" },
      { value: "use_always", intlId: "options.patterns.use_always" },
    ],
  }),
  tool: () => ({
    input: "radiogroup",
    suffix: "experience",
    intlPrefix: "tools",
    options: [
      {
        value: "never_heard",
        intlId: "options.tools.never_heard",
      },
      { value: "interested", intlId: "options.tools.interested" },
      { value: "not_interested", intlId: "options.tools.not_interested" },
      { value: "would_use", intlId: "options.tools.would_use" },
      { value: "would_not_use", intlId: "options.tools.would_not_use" },
    ],
  }),
  project: () =>
    makeAutocomplete(
      {
        suffix: "prenormalized",
        type: Array,
        arrayItem: {
          type: String,
          optional: true,
        },
      },
      {
        autocompletePropertyName: "name",
        queryResolverName: "projects",
        fragmentName: "ProjectFragment",
        valuePropertyName: "id",
      }
    ),

  people: () =>
    makeAutocomplete(
      {
        suffix: "prenormalized",
        type: Array,
        arrayItem: {
          type: String,
          optional: true,
        },
        options: (props) => {
          return props?.data?.entities.map((document) => ({
            ...document,
            value: document.id,
            label: document.name,
          }));
        },
        query: () => /* GraphQL */ `
          query FormComponentDynamicEntityQuery($value: [String!]) {
            entities(id: { _in: $value }) {
              id
              name
            }
          }
        `,
        autocompleteQuery: () => /* GraphQL */ `
          query AutocompletePeopleQuery($queryString: String) {
            entities(tags: ["people"], name: { _like: $queryString }) {
              id
              name
            }
          }
        `,
      },
      {
        autocompletePropertyName: "name", // overridden by field definition above
        queryResolverName: "entities", // overridden by field definition above
        fragmentName: "EntityFragment", // overridden by field definition above
        valuePropertyName: "id", // overridden by field definition above
      }
    ),
  proficiency: ({ allowother = false }) => ({
    allowmultiple: false,
    allowother,
    input: "radiogroup",
    type: Number,
    randomize: false,
    options: [
      { value: 0 },
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
    ],
  }),
  single: ({ allowother = false }) => ({
    allowmultiple: false,
    allowother,
    input: "radiogroup",
    randomize: false,
    suffix: "choices",
  }),
  multiple: ({ id, allowother = false }) => ({
    allowmultiple: true,
    allowother,
    input: "checkboxgroup",
    randomize: true,
    suffix: "choices",
  }),
  others: () => ({
    input: "textarea",
    suffix: "others",
    limit: 150,
  }),
  others_textarea: () => ({
    input: "textarea",
    suffix: "others",
    limit: 150,
  }),
  text: () => ({ input: "text", limit: 150 }),
  longtext: () => ({ input: "textarea" }),
  email: () => ({ input: "email" }),
  opinion: () => ({
    input: "radiogroup",
    type: Number,
    options: [
      { value: 0, intlId: "options.opinions.0" },
      { value: 1, intlId: "options.opinions.1" },
      { value: 2, intlId: "options.opinions.2" },
      { value: 3, intlId: "options.opinions.3" },
      { value: 4, intlId: "options.opinions.4" },
    ],
  }),
  // statictext: () => ({}),
  // just normal text
  help: () => ({ input: Help }),
  happiness: () => ({
    input: "radiogroup",
    type: Number,
    options: [
      { value: 0, intlId: "options.happiness.0" },
      { value: 1, intlId: "options.happiness.1" },
      { value: 2, intlId: "options.happiness.2" },
      { value: 3, intlId: "options.happiness.3" },
      { value: 4, intlId: "options.happiness.4" },
    ],
  }),
  country: () => {
    return {
      input: "select",
      options: countriesOptions,
    };
  },
  bracket: (/*questionObject: any*/) => {
    return {
      input: Bracket,
      type: Array,
      // TODO: probably wont work
      arrayItem: {
        type: Array,
        // typeName: 'Int[]',
        optional: true,
        arrayItem: {
          type: Number,
          optional: true,
        },
      },
    };
  },
  email2: () => ({ input: Email2 }),
  receive_notifications: () => ({ input: Hidden, type: Boolean }),
  race_ethnicity: ({ id, allowother = false }) => ({
    allowmultiple: true,
    allowother,
    randomize: true,
    suffix: "choices",
    input: RaceEthnicity,
  }),
};
