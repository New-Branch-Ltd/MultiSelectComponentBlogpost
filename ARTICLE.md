# Multi-Range selector component

## Introduction
Multi-range selector or multi-interval selector input is unversal type of input with many use-cases. Some of them are selecting multiple parts of audio|video recording to perform actions on. Just to  

What is multi-range selector? We can define multi-range selector as an input field on
Creating a multi-range(multi-interval) selector component can be used for several different or other components with complex specifications can be a daunting task. With this article I will hopefully introduce you to the art of creating such components and the process of doing that. This article will follow the process of creation of one such component - multi range selector. In my experience as a software developer I have occasionally needed to create such complex components...


## Specification
We are going to create a multi-range selector. [IMAGE]

- Double click on empty space in the range bar to create new area
- Remove area

## Implementation

#### Setup
Let's start by setting up a container, state and some constants to mark minimum
and maximum of selectible numbers.

```tsx
const MIN = 0;
const MAX = 1000;

interface IntervalType {
  min: number;
  max: number;
}

function App() {
  const [intervals, setIntervals] = useState<IntervalType[]>([{min: 0, max: 1000}])

  return (
    <div className="App">
      <h1>Multi-Interval Selector</h1>

      <div className="container">
        {intervals.map(i => <Interval min={i.min} max={i.max} />)}
      </div>
    </div>
  );
}
```

and an `Interval.tsx` component

```tsx
  interface Props {
    min: number;
    max: number;
  }

  function Interval({min, max}: Props) {
    return (
      <>
        <div className="left-handle" />
        <div className="right-handle" />
      </>
    )
  }
```

and some basic styles to start with:

```css
  .container {
    display: flex;
    justify-content: space-between;
    width: 800px;
    height: 200px;
    background: rgba(0,100,255,0.3);
  }

  .left-handle, .right-handle {
    width: 40px;
    height: 100%;
    background: rgba(0,100,255,0.8);
  }

  .left-handle:hover, .right-handle:hover {
    cursor: pointer;
    background: rgb(0,100,255);
  }
```

#### Hooking Min and Max

Out first job will be to hook min and max props of the `Interval.tsx` component to the positions of the handles.

#### Event Listeners

Our first job will be to make the handles functionable. That will include 

- Event listeners
- Create functionaity
- Remove functionality


## Notes about testing | a11y | mobile
When it comes to testing, this kind of components can be tested via unit test. I'd rather recommend testing them via an integration test library like cypress or playwright.
TODO Examples::

## Summary
We created a multi-range selector component that can be used in audio files editor | video editor...