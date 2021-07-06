import React, { useState } from 'react'

import { Button } from '@entur/button'
import { Contrast } from '@entur/layout'
import { Heading2 } from '@entur/typography'

import Autosuggest from '../../components/Autosuggest'

import Search from './Search'
import './styles.css'

const Home: React.FC = () => {
    const [origin, setOrigin] = useState<string>('')
    const [destination, setDestination] = useState<string>('')

    const [dateTime, setDateTime] = useState<string>(new Date().toISOString())

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
                <Button
                    style={{ marginTop: 20 }}
                    variant="primary"
                    onClick={() => setDateTime(new Date().toISOString())}
                    disabled={!origin || !destination}
                >
                    Søk
                </Button>
            </Contrast>
            <div className="column">
                <Search
                    searchParams={{ origin, destination, dateTime }}
                    defaultOtpVersion={1}
                />
            </div>
            <div className="column">
                <Search
                    searchParams={{ origin, destination, dateTime }}
                    defaultOtpVersion={2}
                />
            </div>
        </div>
    )
}

export default Home
