import { generateFiltersQuery } from '../filters'

export type PipelineProps = {
    survey: string
    key: string
    facet?: string
    fieldId: string
    year?: number
    filters?: any
    limit: number
    match?: any
    cutoff?: number
}

const getFacetPath = (facet: string | undefined) => {
    // make exception for some fields if their paths are different
    switch (facet) {
        case 'gender':
            return 'gender.choices'

        case 'race_ethnicity':
            return 'race_ethnicity.choices'

        case 'yearly_salary':
            return 'yearly_salary.choices'

        case 'industry_sector':
            return 'industry_sector.choices'

        case 'disability_status':
            return 'disability_status.choices'

        case 'company_size':
            return 'company_size.choices'

        case 'years_of_experience':
            return 'years_of_experience.choices'

        case 'higher_education_degree':
            return 'higher_education_degree.choices'

        case 'source':
            return 'source.normalized'

        case 'country':
            return 'country_alpha3'

        default:
            return facet
    }
}

// generate an aggregation pipeline for all years, or
// optionally restrict it to a specific year of data
export const getGenericPipeline = (pipelineProps: PipelineProps) => {
    const { survey, filters, key, facet, fieldId, year, limit, cutoff = 1 } = pipelineProps

    const facetPath = getFacetPath(facet)

    const match: any = {
        survey,
        [key]: { $nin: [null, '', []] },
        ...generateFiltersQuery(filters)
    }

    // if year is passed, restrict aggregation to specific year
    if (year) {
        match.year = year
    }

    const pipeline: any[] = [
        {
            $match: match
        },
        // { $count: 'questionRespondents' },
        {
            $unwind: {
                path: `$${key}`
            }
        },
        ...(facetPath
            ? [
                  {
                      $unwind: {
                          path: `$user_info.${facetPath}`
                      }
                  }
              ]
            : []),
        {
            $group: {
                _id: {
                    year: '$year',
                    ...(facet && { [facet]: `$user_info.${facetPath}` }),
                    [fieldId]: `$${key}`
                },
                count: {
                    $sum: 1
                }
            }
        },
        {
            $group: {
                _id: {
                    year: '$_id.year',
                    ...(facet && { [facet]: `$_id.${facet}` })
                },
                buckets: {
                    $push: {
                        id: `$_id.${fieldId}`,
                        count: '$count'
                    }
                }
            }
        },
        {
            $group: {
                _id: {
                    year: '$_id.year'
                },
                facets: {
                    $push: {
                        type: facet ?? 'default',
                        id: facet ? `$_id.${facet}` : 'default',
                        count: '$count',
                        buckets: '$buckets'
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                year: `$_id.year`,
                facets: 1
            }
        },
        { $sort: { year: 1 } }
    ]

    // if (cutoff) {
    //     pipeline.push({ $match: { count: { $gt: cutoff } } })
    // }

    // only add limit if year is specified
    // if (year) {
    //     pipeline.push({ $limit: limit })
    // }

    return pipeline
}
