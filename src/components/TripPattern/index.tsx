import React from 'react'
import {
    BusIcon,
    CarIcon,
    DestinationIcon,
    FerryIcon,
    PlaneIcon,
    SubwayIcon,
    TrainIcon,
    TramIcon,
    WalkingIcon,
} from '@entur/icons'
import { LegLine, TravelTag } from '@entur/travel'
import { colors } from '@entur/tokens'
import { Heading3, SmallText } from '@entur/typography'
import { formatTime } from '../../utils/time'

import './styles.css'

interface Props {
    tripPattern: any
}

function getTransportIcon(mode: string) {
    switch (mode) {
        case 'bus':
            return <BusIcon />
        case 'car':
            return <CarIcon />
        case 'rail':
            return <TrainIcon />
        case 'tram':
            return <TramIcon />
        case 'water':
            return <FerryIcon />
        case 'air':
            return <PlaneIcon />
        case 'metro':
            return <SubwayIcon />
        case 'foot':
            return <WalkingIcon />
        default:
            return null
    }
}

const TripPattern: React.FC<Props> = ({ tripPattern }) => (
    <div key={tripPattern.id} className="trip-pattern">
        <div className="trip-pattern__header">
            <Heading3 margin="none">
                Fra {tripPattern.legs[0].fromPlace.name}
            </Heading3>
            <div>
                <SmallText>
                    {Math.round(tripPattern.duration / 60)} min
                </SmallText>
            </div>
        </div>
        <div className="trip-pattern__legs">
            {tripPattern.legs.map((leg: any) => (
                <div key={leg.expectedStartTime} className="trip-pattern__leg">
                    <TravelTag>
                        {getTransportIcon(leg.mode)}
                        {leg.line?.publicCode}
                    </TravelTag>
                    <div>
                        <SmallText>
                            {formatTime(leg.expectedStartTime)}
                        </SmallText>
                    </div>
                </div>
            ))}
            <LegLine
                className="trip-pattern__leg-line"
                color={colors.greys.grey20}
                pattern="line"
                direction="horizontal"
            />
            <div>
                <TravelTag>
                    <DestinationIcon />
                </TravelTag>
                <div>
                    <SmallText>
                        {formatTime(tripPattern.expectedEndTime)}
                    </SmallText>
                </div>
            </div>
        </div>
    </div>
)

export default TripPattern
