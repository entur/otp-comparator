import React, { useState } from 'react'

import { Heading2, Paragraph } from '@entur/typography'
import { Loader } from '@entur/loader'

import './styles.css'
import { useEffect } from 'react'
import TripPattern from '../../components/TripPattern'
import { Dropdown } from '@entur/dropdown'

const QUERY_OTP1 = `
query ($numTripPatterns: Int!, $from: Location!, $to: Location!, $dateTime: DateTime!, $arriveBy: Boolean!, $modes: [Mode], $transportSubmodes: [TransportSubmodeFilter], $walkSpeed: Float, $minimumTransferTime: Int, $banned: InputBanned, $whiteListed: InputWhiteListed) {
    trip(
      numTripPatterns: $numTripPatterns,
      from: $from,
      to: $to,
      dateTime: $dateTime,
      arriveBy: $arriveBy,
      modes: $modes,
      transportSubmodes: $transportSubmodes,
      walkSpeed: $walkSpeed,
      minimumTransferTime: $minimumTransferTime,
      banned: $banned,
      whiteListed: $whiteListed
    ) {
      tripPatterns {
        aimedStartTime
        aimedEndTime
        expectedStartTime
        expectedEndTime
        directDuration
        duration
        distance
        walkDistance
        legs {
          aimedStartTime
          expectedStartTime
          aimedEndTime
          expectedEndTime
          mode
          transportSubmode
          fromPlace {
            name
          }
          line {
              id
              publicCode
          }
        }
      }
    }
  }
  `
const QUERY_OTP2 = `
  query ($numTripPatterns: Int!, $from: Location!, $to: Location!, $dateTime: DateTime!, $arriveBy: Boolean!, $modes: Modes, $walkSpeed: Float, $banned: InputBanned, $whiteListed: InputWhiteListed) {
      trip(
        numTripPatterns: $numTripPatterns,
        from: $from,
        to: $to,
        dateTime: $dateTime,
        arriveBy: $arriveBy,
        modes: $modes,
        walkSpeed: $walkSpeed,
        banned: $banned,
        whiteListed: $whiteListed
      ) {
        tripPatterns {
          expectedStartTime
          expectedEndTime
          directDuration
          duration
          distance
          walkDistance
          legs {
            aimedStartTime
            expectedStartTime
            aimedEndTime
            expectedEndTime
            mode
            transportSubmode
            fromPlace {
                name
            }
            line {
                id
                publicCode
            }
          }
        }
      }
    }
    `

function getBaseUrl(env: string) {
    switch (env) {
        case 'dev':
            return 'https://api.dev.entur.io'
        case 'staging':
            return 'https://api.staging.entur.io'
        default:
            return 'https://api.entur.io'
    }
}

function getApiVersion(otpVersion: number) {
    switch (otpVersion) {
        case 2:
            return 'v3'
        default:
            return 'v2'
    }
}

async function search(
    searchParams: any,
    otpVersion: number,
    env: string,
): Promise<any> {
    const url = `${getBaseUrl(env)}/journey-planner/${getApiVersion(
        otpVersion,
    )}/graphql`

    const query = otpVersion === 1 ? QUERY_OTP1 : QUERY_OTP2

    if (!searchParams.origin || !searchParams.destination) {
        return []
    }

    const result = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ET-Client-Name': 'entur-otp-comparator',
        },
        body: JSON.stringify({
            query,
            variables: {
                numTripPatterns: 5,
                dateTime: new Date().toISOString(),
                arriveBy: false,
                ...searchParams,
                from: {
                    place: searchParams.origin,
                },
                to: {
                    place: searchParams.destination,
                },
            },
        }),
    })

    const body = await result.json()

    return body?.data?.trip?.tripPatterns || []
}

const Search: React.FC<Props> = (props) => {
    const { searchParams, defaultOtpVersion, defaultEnvironment } = props

    const [otpVersion, setOtpVersion] = useState<number>(defaultOtpVersion ?? 1)
    const [environment, setEnvironment] = useState<string>(
        defaultEnvironment ?? 'prod',
    )

    const [loading, setLoading] = useState<boolean>(false)
    const [result, setResult] = useState<any[]>([])
    const [executionTime, setExecutionTime] = useState<number>(0)

    useEffect(() => {
        if (!searchParams.origin || !searchParams.destination) {
            return
        }
        const start = new Date()
        setLoading(true)
        search(searchParams, otpVersion, environment)
            .then((res) => {
                setExecutionTime(new Date().getTime() - start.getTime())
                setResult(res)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [searchParams, otpVersion, environment])

    return (
        <div>
            <Heading2>
                OTP {otpVersion} {environment}
            </Heading2>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginTop: 20,
                    marginBottom: 20,
                }}
            >
                <Dropdown
                    label="OTP"
                    value={'' + otpVersion}
                    items={['1', '2']}
                    style={{ flex: 1 }}
                    onChange={(item) =>
                        setOtpVersion(
                            item ? Number(item.value) : defaultOtpVersion ?? 1,
                        )
                    }
                />
                <Dropdown
                    label="Miljø"
                    items={['prod', 'staging', 'dev']}
                    style={{ flex: 1 }}
                    value={environment}
                    onChange={(item) =>
                        setEnvironment(
                            item?.value ?? defaultEnvironment ?? 'prod',
                        )
                    }
                />
            </div>
            {loading ? <Loader /> : <div style={{ height: 5 }} />}
            <Paragraph>
                {executionTime > 0
                    ? `Søketid: ${loading ? '...' : executionTime} ms`
                    : ' '}
            </Paragraph>
            {result.map((tripPattern, index) => (
                <TripPattern key={index} tripPattern={tripPattern} />
            ))}
        </div>
    )
}

interface Props {
    searchParams: any
    defaultOtpVersion?: number
    defaultEnvironment?: string
}

export default Search
