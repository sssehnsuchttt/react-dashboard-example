import React, { useState, Children } from 'react';
import './styles/SwipeableView.css';
import { useSwipeable } from 'react-swipeable';
import { NavbarHorizontal, NavbarHorizontalButton } from "./Navbar"
const SwipeableView = ({ children }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [offset, setOffset] = useState(0);
    const numChildren = Children.count(children);
    const handleSwipe = (direction) => {
        if (direction === 'left' && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else if (direction === 'right' && currentIndex < Children.count(children) - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => handleSwipe('right'),
        onSwipedRight: () => handleSwipe('left'),
       
    });
    const handleButtonClick = (index) => {
        setCurrentIndex(index);
    };

    const childArray = Children.toArray(children);

    return (
        <div style={{display: "flex"}}>
            <NavbarHorizontal active={currentIndex}>
                
                {childArray.map((child, index) => (
                    <NavbarHorizontalButton
                        key={index}
                        active={index === currentIndex}
                        text={child.props.text}
                        onClick={() => handleButtonClick(index)}
                    />
                ))}
            </NavbarHorizontal>
            <div className="swipeable-container" {...handlers}>
                <div
                    className="swipeable-content"
                    style={{
                        transform: `translateX(calc(-${(currentIndex * 100)/numChildren}%)`,
                        transition: 'transform 0.15s ease-in-out',
                    }}
                >
                    {childArray.map((child, index) => (
                        <div key={index} className="swipeable-item">
                            {child}
                        </div>
                    ))}
                </div>

            </div>
        </div>

    );
};

export default SwipeableView;