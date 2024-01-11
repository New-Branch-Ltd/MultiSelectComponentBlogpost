# Multi-Interval Selector Component

## Introduction

In the ever-evolving landscape of user interface design, crafting intuitive and efficient components is important to delivering a good user experience.

In this article, we delve into the basics of developing this kind of component using React and exploring its capabilities. Some of the use cases are: Selecting parts of audio recording to be edited by audio manipulation software, selecting parts of a video to be cut or more generally selecting multiple intervals of some data to operate on.

Current implementation is going to be rather simple. We will have a container where we render the multi-interval selector. We will have the ability to create a new interval by double clicking on an empty space. We will also have an `X` button to delete an interval. Each interval will have handles to hold and drag. We will also add some logic for collission detection so that the intervals don't overlap. The final component will look something like this.

<!-- TODO Insert code sandbox -->

## Defining the component's interface

Let's start by setting up the related objects and components interfaces.

An interval will be represented by a simple object with `min` and `max` properties.
```ts
// Interval.ts
interface Interval {
  min: number;
  max: number;
}
```

Our custom component will be called `MultiIntervalSelect`. As any other component
that gets input from the user, it needs to have a property for the initial
selected value and a handler, that will be invoked whenever the user
changes the selection.

In practice, there will always be an upper and a lower bound that the intervals
will have to obey to. For example, if we are selecting multiple ranges of a 
video file that we want to cut, or to apply filter to, then the lower bound will
be zero, and the upper bound will be the length of the video. We will define
a `domain` property to represent this.

Another decision we have to make is how to define the component's dimensions on
the screen. Do we need it to fill all the available space in the parent
component, to be responsive and change with screen dimensions, or it will always
have a fixed size? In the real life, these are very nice questions that we need
to answer. But, for the sake of simplicity we will assume that our component
will always have a fixed dimensions, and we will use `width` and `height` properties.

In the end, our main component interface will look something like this:
```ts
// MultiIntervalSelect.ts
interface Props {
  domain: Interval;
  width: number;
  height: number;
  initialValue: Interval[];
  onChange: (newValue: Interval[]) => void;
}

function MultiIntervalSelect(props: Props) {
  return <div className="container">TODO</div>;
}
```

<!-- Aside -->
In general each input can be either controlled or uncontrolled. Controlled in short means that its value is controlled with props and its updates are handled by the container component that is rendering it. Uncontrolled on the other hand means that the container may provide `initialValue`, but doesn't control the actual value of the input. It is handled internally. In our case we are going to create an uncontrolled input, because many of the logic related to a `MultiIntervalSelect` component is in fact state manipulation logic. 
<!-- /ASIDE -->

## Rendering selected intervals on the screen

The next step is to render the selected intervals on the screen. For each
interval, we will create a left and a right handle, that will later be used to
resize the interval by dragging them. Those handles will be rendered inside a container
div and will be positioned on the left and right side of that container. We will need to pass a pixels offset, where this interval is rendered and width in pixels for the interval. I will note that there are possible apis for this kind of component. We could pass the interval itself with domain values and transformation function to calculate the pixels pased on those values. I think it is better to keep this `SingleInterval` component as simple as possible. This is generally a good principle to follow.

We will use a helper component for rendering a single interval, and we can start with the following boilerplate:

```tsx
// SingleInterval.tsx
interface Props {
  offsetLeft: number;
  width: number;
}

// TODO Should we add a middle handle? What are the benefits
// TODO Should we add a contianer instead of a middle handle?
// TODO Add the delete button
// TODO Do we count the handles

// TODO Can we implement the component, without relying on specific css/visual properties, e.g. Handle width?

function SingleInterval(props: Props) {
  const {offsetLeft, width} = props;

  return (
    <div className="single-interval" style={{left: offsetLeft, width}}>
      <div className="left-handle" />
      <div className="right-handle" />
    </div>
  );
}
```

There is an important question that we haven't discussed yet. Are the handles part of the interval? The answer may vary depending on your particular needs. What makes the most sense in my opinion is that we should position the handles right at the edges of the interval, so half of a handle will be in the interval, the other half outside. 

Next I will add css to position the handles on the left and right side of the interval and offset them by half of `--handle-width`.

```css
/* MultiIntervalSelect.css */
.container {
  display: flex;
  position: relative;
  background-color: #FCF9BE;
  --handle-width: 20px;
}

.single-interval {
  position: absolute;
  height: 100%;
  display: flex;
  justify-content: space-between;
  background-color: #FFDCA9;
}

.left-handle,
.right-handle {
  width: var(--handle-width);
  height: 100%;
  position: absolute;
  background: rgba(250, 171, 120);
  user-select: none;
}

.left-handle {
  left: calc(-1 * var(--handle-width) / 2);
}

.right-handle {
  left: calc(100% - (var(--handle-width) / 2));
}

.left-handle:hover,
.right-handle:hover {
  cursor: pointer;
  background: rgb(220, 141, 90);
}

```

Then the main component will create a container with the specified dimensions,
and render a `SingleInterval` component for each interval. I will also pass the exact position that the interval should be rendered to and the width of the interval. To calculate the exact position we will need a transformation function to go from one range to the other. Transformation function implementation will look something like this:

```ts
  export function domainValueToContainerPosition(
    containerWidth: number,
    domain: Interval
  ) {
    return (intervalValue: number) =>
      (intervalValue * containerWidth) / (domain.max - domain.min);
  }
```

In the future we will need also a transformation function to transform container pixels position to a domain value so I might as well show you implementation for that now:

```ts
  export function containerPositionToDomainValue(
    containerWidth: number,
    domain: Interval
  ) {
    return (containerPosition: number) =>
      (containerPosition * (domain.max - domain.min)) / containerWidth;
  }
```

Both functions are higher order functions. I did that just to improve usability. We call them once with the `containerWidth` and `domain` and then we can easily use the returned function many times. These kind of functional programming ideas can sometimes be used in React and JavaScript in general to reduce quantity of code and improve readability.


```tsx
// MultiIntervalSelect.tsx
function MultiIntervalSelect(props: Props) {
  const { initialValue, width, height, domain, onChange } = props;

  const [intervals, setIntervals] = useState<Interval[]>(initialValue);
  
  const intervalToContainer = domainValueToContainerPosition(
    width,
    domain
  );

  const style = {
    width,
    height,
  };

  return (
    <div className="container" style={style}>
      {intervals.map((i, index) => {
        const pixelsLeft = intervalToContainer(i.min)
        const pixelsRight = intervalToContainer(i.max)

        return (
          <SingleInterval
            key={index}
            width={pixelsRight - pixelsLeft}
            offsetLeft={pixelsLeft}
          />
        )}
      ))}
    </div>
  );
}
```

In the implementation you might have noticed that I am passing index as key. This is generally bad, especially if you have a reorder functionality. In our case we don't have a better option, because it will be possible to have intervals that start from the exact same position and end in the same position. Note that this doesn't really make sense in practise so if we were to disable that we could use min/max as key, which would be better. For the sake of simplicity I am using index here as key. It shouldn't brake any of the functionality becase we will not reorder the intervals in out state.


## Implementing create interaction
So let's start by implementing the creation of intervals. The idea is realtively straight-forward. When a user double clicks anywhere on the interval that is not in an already existing interval, we will create an interval with length 0 at the mouse position. This is not a particularly good interaction for mobile or in terms of accessibility, but it is the easiest to implement and I don't really have a better idea for interval creation interaction.

```tsx
  // MultiIntervalSelect.tsx

  // ...
  const containerRef = useRef<HTMLDivElement | null>(null);

  const intervalToContainer = domainValueToContainerPosition(
    width,
    domain
  )

  const containerToInterval = containerPositionToDomainValue(
    width,
    domain
  );

  const handleDoubleClick: MouseEventHandler<HTMLDivElement> = (ev) => {
    if (!containerRef.current) return;

    const containerBox = containerRef.current.getBoundingClientRect();

    const mousePos = ev.clientX;
    const mousePosInPx = mousePos - containerBox?.x;
    const mousePosInIntervalValue = containerToInterval(mousePosInPx);

    const isOutsideIntervals = intervals.every(
      (i) => mousePosInIntervalValue < i.min || mousePosInIntervalValue > i.max
    );

    if (isOutsideIntervals) {
      const newInterval = {
        min: mousePosInIntervalValue,
        max: mousePosInIntervalValue,
      };

      const newIntervals = sortBy([...intervals, newInterval], "min");
      setIntervals(newIntervals);
      props.onChange(newIntervals);
    }
  };

  return (
    <div 
      className="container" 
      style={style}       
      ref={containerRef}
      onDoubleClick={handleDoubleClick}
    >
      {intervals.map((i, ind) => {
        const pixelsLeft = intervalToContainer(i.min)
        const pixelsRight = intervalToContainer(i.max)

        return (
          <SingleInterval
            key={ind}
            interval={i}
            width={pixelsRight - pixelsLeft}
            offsetLeft={pixelsLeft}
          />
        )}
      ))}
    </div>
  );
}
```

A few things in the code that I haven't explained already. First you might have seen that we have a ref of the container of all intervals. We use and need that ref to calculate the pixels offset of the container on the page. There is also a possibility to get that element with the DOM Api, but this is not the recommended way in React.

You also might have noticed that I have sorted all intervals with the lodash `sortBy` function. This is rather important to make our job easier for the future. (especially when we start thinking about handling collision between intervals)

I think at this point it will be a good idea to also display the interval values inside the `SingleInterval.tsx` and also hook the delete functionality. To display the interval values we can just pass the interval to `SingleInterval.tsx` component as props and render the values under the handles by positioning them absolutely.

About the delete interaction we can render an `X` button at the top right of interval and call `onDelete` callback when the button is pressed. 

```tsx
interface Props {
  interval: Interval;
  offsetLeft: number;
  width: number;
  onDelete: () => void;
}

function SingleInterval(props: Props) {
  const {
    interval,
    offsetLeft,
    width,
    onDelete,
  } = props;

  return (
    <div
      className="single-interval"
      style={{ left: offsetLeft, width }}
    >
      <div className="left-handle">
        <span className="value">{Number(interval.min).toFixed(1)}</span>
      </div>
      <div className="right-handle">
        <span className="value">{Number(interval.max).toFixed(1)}</span>
      </div>
      <button type="button" className="delete-button" onClick={onDelete}>
        X
      </button>
    </div>
  );
}
```

```tsx
  // MultiIntervalSelect.tsx

  // ...
  function onDelete(interval: Interval) {
    return () => {
      const newIntervals = intervals.filter((i) => i !== interval);
      setIntervals(newIntervals);
      props.onChange(newIntervals);
    };
  }

  return (
    <div
      className="container"
      style={style}
      ref={containerRef}
      onDoubleClick={handleDoubleClick}
    >
      {intervals.map((i, ind) => {
        const pixelsLeft = intervalToContainer(i.min)
        const pixelsRight = intervalToContainer(i.max)

        return (
          <SingleInterval
            offsetLeft={pixelsLeft}
            width={pixelsRight - pixelsLeft}
            key={ind}
            interval={i}
            onDelete={onDelete(i)}
          />
       )})}
    </div>
  );
```


```css
  /* MultiIntervalSelect.css */
  /* ... */

  .delete-button {
    position: absolute;
    left: calc(100% + (var(--handle-width) /2));
    top: -20px;
    user-select: none;
  }

  .value {
    position: relative;
    top: 100%;
  }
```

## Resizing intervals
Our next task will be a bit more complicated. We need to hook up dragging logic for the handles.

Here is the plan. We detect handle mouse grab (`mousedown` event). We save in the `MultiIntervalSelect` component state, which handle is dragged. We will also setup `mousemove` event, in which we check if we have handle that is dragged, we move it to the mouse position, otherwise we will do nothing. On `mouseup` event we remove the state that a handle is dragged. Now, one thing to keep in mind is that `mousemove` and `mouseup` events are actually set up on the window object. That is necessary because you can drag the mouse outside any other container and then release the mouse. In the actual state we can keep `null` if nothing is dragged and `"index"-"left || right"` to identify the correct handle that is dragged. There are many ways to encode and decode the exact handle that is dragged. For example we could simply save the handle position on the screen in the state. There aren't any particular pros and cons for one idea over another. I'd suggest to do what makes most sense to you and your team.

Let's start by setting up the state and the `mousedown` interaction.

```tsx
  //MultiIntervalSelect.tsx

  type MovingHandle = `${number}-${'left' | 'right'}` | null;

  // ...
  const [movingHandle, setMovingHandle] = useState<MovingHandle>(null);


  // ...
    return (
      <div
        className="container"
        style={style}
        ref={containerRef}
        onDoubleClick={handleDoubleClick}
      >
        {intervals.map((i, ind) => {
          const pixelsLeft = intervalToContainer(i.min)
          const pixelsRight = intervalToContainer(i.max)

          return (
            <SingleInterval
              offsetLeft={pixelsLeft}
              width={pixelsRight - pixelsLeft}
              key={ind}
              interval={i}
              onLeftDown={() => setMovingHandle(`${ind}-left`)}
              onRightDown={() => setMovingHandle(`${ind}-right`)}
              onDelete={TODO}
            />
        )})}
    </div>
  );
```

```tsx
// SingleInterval.tsx
function SingleInterval(props: Props) {
  const {
    interval,
    offsetLeft,
    width,
    onLeftDown, 
    onRightDown,
    onDelete,
  } = props;

  return (
    <div
      className="single-interval"
      style={{ left: offsetLeft, width }}
    >
      <div className="left-handle" onMouseDown={onLeftDown} />
      <div className="right-handle" onMouseDown={onRightDown}> /
    </div>
  );
}
```

Next I will setup the `mouseup` event. I will set it up in React `useEffect` hook. Again the idea is to set up a listener on the window when the component is mounted and clean up the event listener when the component is unmounted. Here is the code for that:

```tsx
// MultiIntervalSelect.tsx

// ...
useEffect(() => {
  function stopMoving() {
    setMovingHandle(null);
  }

  window.addEventListener("mouseup", stopMoving);

  return () => {
    window.removeEventListener("mouseup", stopMoving);
  };
}, []);

// ...
```

And lastly the `mousemove` interaction. I will also need to set it up in `useEffect`. One thing that I didn't mention already about the mousemove interaction is that we will also need to handle collision between intervals here. The logic for that will be simple: If we are dragging the left handle, it shouldn't go before the previous interval right handle and if we are dragging a right handle, it shouldn't go after the next interval's left handle. With that in mind here is the code:

```tsx
  useEffect(() => {
    const handleMouseMove = (ev: MouseEvent) => {
      if (!containerRef.current || !movingHandle) return;
      const containerBox = containerRef.current?.getBoundingClientRect();

      const [indexStr, side] = movingHandle.split("-");

      const relevantIndex = Number(indexStr);
      const relevantInterval = intervals.find(
        (_i, ind) => ind === relevantIndex
      );
      const { min, max } = relevantInterval!;
      const previousInterval = intervals[relevantIndex - 1];
      const nextInterval = intervals[relevantIndex + 1];
      
      const mousePos = ev.clientX;
      const containerMin = containerBox.x;
      const positionInPx = mousePos - containerMin;
      const positionInInterval = containerToInterval(positionInPx);
      
      let newInterval: Interval = relevantInterval!;

      if (side === "left") {
        const minInIntervalBounded = Math.min(
          max,
          Math.max(
            positionInInterval,
            previousInterval ? previousInterval.max : domain.min
          )
        );
        newInterval = { min: minInIntervalBounded, max };
      } else {
        const maxInIntervalBounded = Math.max(
          min,
          Math.min(
            positionInInterval,
            nextInterval ? nextInterval.min : domain.max
          )
        );
        newInterval = { min, max: maxInIntervalBounded };
      }

      const newIntervals = intervals.map((i, index) =>
        index === relevantIndex ? newInterval : i
      );

      setIntervals(newIntervals);
      onChange(newIntervals);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [movingHandle, intervals, containerRef, onChange, containerToInterval, domain]);
``` 


With this we have a functional implementation following the specification. 

<!-- TODO Code Sandbox embed here -->

## Further Improvements  
- Accessibility: Current implementation is NOT accessible. A few suggestions I have are to make sure that handles and remove buttons are targetable by tab. Maybe increase/decrease of interval with arrows can also be implemented. Also check the aria roles to make sure that screen readers understand properly what we have on screen. 
  
- Mobile: This component is not particularly convienient for mobile users. The handles should be a little bigger to increase comfort and usability. Also events might be required to change `onDoubleClick` to `onDoubleTap` etc.
  
- Background Image: In many cases you would want to render an image/graph behind the multi-interval selector. You can do that by positioning the image with `position: absolute` and using semi-transparent colors for the actual multi-interval selector intervals.

- Generality: This component is pretty specific. If we want to make it even more reusable we could improve that by allowing the user to pass TextRenderer component, DeleteButton component and maybe even a HandleRenderer component.

- More complicated interactions: There are ideas how this component might be upgraded to handle more complication interaction. For example we can allow dragging of the whole interval to left and right via the middle part. We could also automatically combine intervals when their handles are next to each other. Because in most real world cases two intervals `A-B` and `B-C` should be the same as one interval `A-C`. Another idea is to automatically delete intervals with the length of 0. In practise this kind of interval are pretty much useless. Of course implementing this kind of interaction would require a rework of the creation logic.

You can check all of the source code in [GitLab](https://gitlab.com/new-branch-ltd/multi-range-selector-blogpost)


You can view a working example in [CodeSandbox](https://codesandbox.io/p/sandbox/multi-interval-vjs8kw?file=%2Fsrc%2FMultiInterval.tsx%3A112%2C50)