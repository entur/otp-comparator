import React from 'react'
import { Dropdown } from '@entur/dropdown'
import createEnturClient from '@entur/sdk'
import { NormalizedDropdownItemType } from '@entur/dropdown/dist/useNormalizedItems'


const enturClient = createEnturClient({
    clientName: 'entur-otp-comparator',
})

interface Props {
    onSelect: (item: NormalizedDropdownItemType | null) => void
    label: string
    placeholder?: string
}

const DEFAULT_ITEMS = [
    {
        value: 'NSR:StopPlace:59872',
        label: 'Oslo S, Oslo',
    },
    {
        value: 'NSR:StopPlace:59983',
        label: 'Bergen stasjon, Bergen',
    },
    {
        value: 'NSR:StopPlace:420',
        label: 'Lillehammer stasjon, Lillehammer',
    },
]

async function search(text: string) {
    if (!text) return DEFAULT_ITEMS

    const featureCollection = await enturClient.geocoder.autocomplete({
        text,
        layers: ['venue'],
    })

    return featureCollection.features.map((feature) => ({
        value: feature.properties.id,
        label: feature.properties.label || feature.properties.name,
    }))
}

const Autosuggest: React.FC<Props> = ({ onSelect, label, placeholder }) => {
    return (
        <Dropdown
            items={search}
            searchable
            clearable={false}
            debounceTimeout={300}
            onChange={onSelect}
            label={label}
            placeholder={placeholder}
        />
    )
}

export default Autosuggest
