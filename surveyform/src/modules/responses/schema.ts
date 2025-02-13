import surveys from "~/surveys";

import {
  getQuestionObject,
  getQuestionSchema,
  getQuestionFieldName,
} from "./helpers";
import { VulcanGraphqlSchema } from "@vulcanjs/graphql";

export const schema: VulcanGraphqlSchema = {
  // default properties

  _id: {
    type: String,
    optional: true,
    canRead: ["guests"],
  },
  createdAt: {
    type: Date,
    optional: true,
    canRead: ["owners", "admins"],
  },
  updatedAt: {
    type: Date,
    optional: true,
    canRead: ["owners", "admins"],
  },
  // unlike updatedAt, this tracks when the user clicked "submit" on the client,
  // not when the server finished the update
  lastSavedAt: {
    type: Date,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["owners", "admins"],
  },
  // tracks the most recent time the user reached the end of the survey
  finishedAt: {
    type: Date,
    optional: true,
    canRead: ["owners", "admins"],
  },
  /**
   * NOTE: this userId is only present in Response
   * It is removed in the NormalizedResponse that can be made public
   */
  userId: {
    type: String,
    optional: true,
    canRead: ["members"],
    relation: {
      fieldName: "user",
      typeName: "User",
      kind: "hasOne",
    },
  },

  // custom properties

  year: {
    type: Number,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["admins"],
    canUpdate: ["admins"],
  },
  duration: {
    type: Number,
    optional: true,
    canRead: ["owners"],
  },
  completion: {
    type: Number,
    optional: true,
    canRead: ["owners", "admins"],
  },
  knowledgeScore: {
    type: Number,
    optional: true,
    canRead: ["owners", "admins"],
  },
  locale: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
  },
  isSynced: {
    type: Boolean,
    optional: true,
    canRead: ["admins"],
  },
  emailHash: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  isSubscribed: {
    type: Boolean,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  context: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  surveySlug: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
    options: surveys.map(({ slug }) => ({
      value: slug,
      label: slug,
    })),
  },
  isNormalized: {
    type: Boolean,
    optional: true,
    canRead: ["admins"],
    canCreate: ["admins"],
    canUpdate: ["admins"],
  },
  normalizedResponseId: {
    type: String,
    optional: true,
    canRead: ["admins"],
    canCreate: ["admins"],
    canUpdate: ["admins"],
  },
  isFinished: {
    type: Boolean,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["members"],
  },
  common__user_info__authmode: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  common__user_info__device: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  common__user_info__browser: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  common__user_info__version: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  common__user_info__os: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  common__user_info__referrer: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  common__user_info__source: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  // surveyId: {
  //   type: String,
  //   canRead: ['guests'],
  //   canCreate: ['members'],
  //   canUpdate: ['admins'],
  //   input: 'select',
  //   relation: {
  //     fieldName: 'survey',
  //     typeName: 'Survey',
  //     kind: 'hasOne',
  //   },
  //   options: ({ data }) =>
  //     get(data, 'surveys.results', []).map(survey => ({
  //       value: survey._id,
  //       label: `[${survey.year}] ${survey.name}`,
  //     })),
  //   query: `
  //   query SurveysQuery {
  //     surveys{
  //       results{
  //         _id
  //         name
  //         year
  //       }
  //     }
  //   }
  //   `,
  // },
};

/*

Just put all questions for all surveys on the root of the schema

*/
let i = 0;
surveys.forEach((survey) => {
  survey.outline.forEach((section) => {
    section.questions &&
      section.questions.forEach((questionOrId) => {
        i++;
        if (Array.isArray(questionOrId)) {
          // NOTE: from the typings, it seems that questions can be arrays? To be confirmed
          throw new Error("Found an array of questions");
        }
        const questionObject = getQuestionObject(questionOrId, section, i);
        const questionSchema = getQuestionSchema(
          questionObject,
          section,
          survey
        );
        const questionId = getQuestionFieldName(
          survey,
          section,
          questionObject
        );
        schema[questionId] = questionSchema;
      });
  });
});

export default schema;
