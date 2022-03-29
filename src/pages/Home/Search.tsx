import React, { useMemo, useState } from 'react'
import { ApolloClient, gql, InMemoryCache } from '@apollo/client'

import { Dropdown } from '@entur/dropdown'
import { Heading2, Paragraph, Link } from '@entur/typography'
import { Loader } from '@entur/loader'
import { Modal } from '@entur/modal'

import './styles.css'
import { useEffect } from 'react'
import TripPattern from '../../components/TripPattern'

const QUERY_OTP1 = gql`
    query (
        $numTripPatterns: Int!
        $from: Location!
        $to: Location!
        $dateTime: DateTime!
        $arriveBy: Boolean!
        $modes: [Mode]
        $transportSubmodes: [TransportSubmodeFilter]
        $walkSpeed: Float
        $minimumTransferTime: Int
        $banned: InputBanned
        $whiteListed: InputWhiteListed
    ) {
        trip(
            numTripPatterns: $numTripPatterns
            from: $from
            to: $to
            dateTime: $dateTime
            arriveBy: $arriveBy
            modes: $modes
            transportSubmodes: $transportSubmodes
            walkSpeed: $walkSpeed
            minimumTransferTime: $minimumTransferTime
            banned: $banned
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

const QUERY_OTP2 = gql`
    query (
        $numTripPatterns: Int!
        $from: Location!
        $to: Location!
        $dateTime: DateTime!
        $arriveBy: Boolean!
        $modes: Modes
        $walkSpeed: Float
        $banned: InputBanned
        $whiteListed: InputWhiteListed
    ) {
        trip(
            numTripPatterns: $numTripPatterns
            from: $from
            to: $to
            dateTime: $dateTime
            arriveBy: $arriveBy
            modes: $modes
            walkSpeed: $walkSpeed
            banned: $banned
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

type OtpVersion = '1' | '2' | 'nordic'

function getBaseUrl(env: string): string {
    switch (env) {
        case 'dev':
            return 'https://api.dev.entur.io'
        case 'staging':
            return 'https://api.staging.entur.io'
        default:
            return 'https://api.entur.io'
    }
}

function getEndpointUrl(otpVersion: OtpVersion, env: string): string {
    const base = getBaseUrl(env)

    if (otpVersion === 'nordic') {
        return `${base}/journey-planner/v3/nordic/graphql`
    }

    return `${base}/journey-planner/${getApiVersion(otpVersion)}/graphql`
}

function getApiVersion(otpVersion: OtpVersion) {
    switch (otpVersion) {
        case '1':
            return 'v2'
        default:
            return 'v3'
    }
}

function getShamashUrl(
    searchParams: any,
    otpVersion: OtpVersion,
    env: string,
): string {
    const service = (() => {
        switch (otpVersion) {
            case '1':
                return 'journey-planner'
            case '2':
                return 'journey-planner-v3'
            case 'nordic':
                return 'journey-planner-nordic'
        }
    })()

    const query = otpVersion === '1' ? QUERY_OTP1 : QUERY_OTP2
    const minifiedQuery = (query.loc?.source.body || '').replace(/\s+/g, ' ')
    const variables = JSON.stringify(searchParams)
    const baseUrl = getBaseUrl(env)

    if (otpVersion === 'nordic') {
        return `${baseUrl}/graphql-explorer/${service}/nordic?query=${minifiedQuery}&variables=${variables}`
    }

    return `${baseUrl}/graphql-explorer/${service}?query=${minifiedQuery}&variables=${variables}`
}

const Search: React.FC<Props> = (props) => {
    const { searchParams, defaultOtpVersion, defaultEnvironment } = props

    const [otpVersion, setOtpVersion] = useState<OtpVersion>(
        defaultOtpVersion ?? '1',
    )
    const [environment, setEnvironment] = useState<string>(
        defaultEnvironment ?? 'prod',
    )

    const [loading, setLoading] = useState<boolean>(false)
    const [result, setResult] = useState<any[]>([])
    const [executionTime, setExecutionTime] = useState<number>(0)

    const [selectedPattern, setSelectedPattern] = useState<any | undefined>()

    const uri = getEndpointUrl(otpVersion, environment)

    const client = useMemo(
        () =>
            new ApolloClient({
                uri,
                cache: new InMemoryCache(),
            }),
        [uri],
    )

    useEffect(() => {
        if (!searchParams.from.place || !searchParams.to.place) {
            return
        }
        const start = new Date()
        setLoading(true)

        client
            .query({
                query: otpVersion === '1' ? QUERY_OTP1 : QUERY_OTP2,
                variables: searchParams,
            })
            .then((res) => {
                setExecutionTime(new Date().getTime() - start.getTime())
                setResult(res.data?.trip?.tripPatterns || [])
            })
            .finally(() => {
                setLoading(false)
            })
    }, [client, searchParams, otpVersion])

    return (
        <div>
            <Heading2>
                OTP {otpVersion} {environment}
            </Heading2>
            <Link
                href={getShamashUrl(searchParams, otpVersion, environment)}
                target="_blank"
            >
                Utforsk i GraphQL Explorer.
            </Link>
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
                    items={['1', '2', 'nordic']}
                    style={{ flex: 1 }}
                    onChange={(item) =>
                        setOtpVersion(
                            item
                                ? (item.value as OtpVersion)
                                : defaultOtpVersion ?? '1',
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
            {!result?.length ? <Paragraph>Ingen resultat.</Paragraph> : null}
            {result.map((tripPattern, index) => (
                <TripPattern
                    key={index}
                    tripPattern={tripPattern}
                    onClick={setSelectedPattern}
                />
            ))}
            <Modal
                open={!!selectedPattern}
                size="large"
                title="Detaljer"
                onDismiss={() => setSelectedPattern(undefined)}
            >
                <pre>{JSON.stringify(selectedPattern, null, 2)}</pre>
            </Modal>
        </div>
    )
}

interface Props {
    searchParams: any
    defaultOtpVersion?: OtpVersion
    defaultEnvironment?: string
}

export default Search
