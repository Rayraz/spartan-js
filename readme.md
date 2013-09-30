# SpartanJS - 0.1.0

SpartanJS is a collection of small, simple, no-nonsense, but functional JavaScript components.

These components are designed to be compact and functional, without adding things you're not going to need.
Each component focusses on doing one task and one task only without the unnecessary bulk from endless lists of convenience methods.

Spartan components let you stick to VanillaJS as much as possible.

## Components

SpartanJS currently contains the following components

 - __Type__, a Type-checking library.
 - __Dom__, a QuerySelectAll wrapper.
 - __Event__, a simple Event handler.
 - __DomReady__, a custom dom ready event handler.
 - __DomEvent__, an Event handler for DOM events, supports event delegation.
 - __Style__, get and set css styles.
 - __Animate__, tween between css styles or translate css styles over time, using WindowAnimationTiming (or a polyfill).
 - __Easing__, custom easing functions for Animate.

## Stability

SpartanJS is still in development and should be considered relatively unstable.
API's can and probably will change, components might be added or split up.

The absolute basics of the library have been tested, but you should expect anything could be broken by a new commit.

## Browser Support

Browser support is currently not actively tested, but this should change in the near future.
That said, SpartanJS aims to support (for now):

- Chrome
- Firefox
- Safari
- IE8+

The exact goals for Mobile device support are still undecided at this point but the goal is to provide reasonable support for IOS and Android users.