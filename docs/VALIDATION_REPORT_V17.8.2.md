# V17.8.2 validation

Root layout shared through early viewport-core. Standalone CSS100vh is measured independently from visualViewport; browser100dvh. Keyboard requires editable focus plus material viewport reduction; small missing extents do not trigger keyboard branch. Loading and all registered overlays use same geometry, root/body share startup paint. Diagnostic report is local and geometry-only.

Dedicated tests: shortened standalone visualViewport (785 vs CSS844), keyboard500px and35px offset, restore and pinch handling, launch class cleanup, early script order, diagnostic data scope. Existing fullscreen/form tests retained. No real iPhone/WebKit render, no production connection/deployment. No magic screen.height compensation. The threshold for keyboard detection is a heuristic, not a definitive platform keyboard API.

Final54/54 local suites PASS, including viewport recovery11/11. All17 backend files byte-identical to input. On-device confirmation pending; diagnostics include last loading geometry.
