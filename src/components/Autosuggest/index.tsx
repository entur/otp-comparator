import React from 'react'
import { Dropdown } from '@entur/dropdown'
import { NormalizedDropdownItemType } from '@entur/dropdown/dist/useNormalizedItems'

interface Props {
    onSelect: (item: NormalizedDropdownItemType | null) => void
    label: string
    placeholder?: string
}

const Autosuggest: React.FC<Props> = ({ onSelect, label, placeholder }) => {
    const search = async (text: string) => {
        if (!text) return []

        const queryParams = new URLSearchParams({
            text,
        })

        const res = await fetch(
            'https://api.entur.io/geocoder/v1/autocomplete?' + queryParams,
            {
                method: 'GET',
                headers: {
                    'ET-Client-Name': 'entur-otp-comparator',
                },
            },
        )

        const featureCollection = await res.json()

        return featureCollection.features.map((feature: any) => ({
            value: feature.properties.id,
            label: feature.properties.label,
        }))
    }

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
