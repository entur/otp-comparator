import React, { useState, useMemo } from 'react'

import { Button } from '@entur/button'
import { DatePicker, TimePicker } from '@entur/datepicker'
import { Contrast } from '@entur/layout'
import { Heading2 } from '@entur/typography'

import Autosuggest from '../../components/Autosuggest'

import Search from './Search'
import './styles.css'

const Home: React.FC = () => {
    const [origin, setOrigin] = useState<string>('')
    const [destination, setDestination] = useState<string>('')

    const [date, setDate] = useState<Date>(new Date())

    const dateTime = date.toISOString()

    const searchParams = useMemo(
        () => ({
            from: {
                place: origin,
            },
            to: {
                place: destination,
            },
            dateTime,
            numTripPatterns: 5,
            arriveBy: false,
        }),
        [origin, destination, dateTime],
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
            <Contrast
                className="column"
                style={{ height: '100vh', width: '22rem' }}
            >
                <Heading2>Søk</Heading2>
                <Autosuggest
                    label="Avreisested"
                    onSelect={(item) =>
                        item ? setOrigin(item.value) : undefined
                    }
                />
                <Autosuggest
                    label="Destinasjon"
                    onSelect={(item) =>
                        item ? setDestination(item.value) : undefined
                    }
                />

                <div style={{ marginTop: 20 }}>
                    <DatePicker
                        selectedDate={date}
                        onChange={(d) => setDate(d as Date)}
                        label="Velg dato"
                    />
                    <TimePicker
                        selectedTime={date}
                        onChange={(d) => setDate(d as Date)}
                        label="Tid"
                    />
                </div>

                <Button
                    style={{ marginTop: 20 }}
                    variant="primary"
                    onClick={() => setDate(new Date())}
                    disabled={!origin || !destination}
                >
                    Sett tid til nå
                </Button>
            </Contrast>
            <div className="column">
                <Search searchParams={searchParams} defaultOtpVersion={1} />
            </div>
            <div className="column">
                <Search searchParams={searchParams} defaultOtpVersion={2} />
            </div>
        </div>
    )
}

export default Home
