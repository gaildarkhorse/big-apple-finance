import React from 'react'
import {
    SmallButtonContainer
} from './styles'

export const SmallButton = (props) => {
    const { buttonImage, caption, handleClick } = props;
    return (
        <SmallButtonContainer onClick={handleClick}>
            {buttonImage ?? <></>}
            <span>{caption}</span>
        </SmallButtonContainer>
    )
}
