# Art Gen/ Resilium

A JavaScript project that allow users to make art by uploading images and editing them
through various algorithms using vanilla JS and OpenCv. The "dog" algorithm is based on a research paper (linked below)
describing an extended difference of gaussians algorithm that inspired me to make this project.

Please note that there may be some bugs. If an algorithm takes more than a minute to finish, refresh the page.

Feel free to fork this project and improve it. Please give credit :)

[Northwestern Paper](https://users.cs.northwestern.edu/~sco590/winnemoeller-cag2012.pdf)

[Project Website]([https://edrickgro.github.io/ArtGen/](https://edrickgro.github.io/SeleniumArt/))

## Known Bugs

Opening a file and then canceling it causes an exception

OpenCV.js sometimes throws exceptions when its been active for too long (this has been bandaged by creating a new worker every
certain number of frames)

Maximizing all of DoG's variables at once cause it to output unexpected images (refresh to fix)

Generate's most common color option sometimes defaults to red, blue, or green (no current workaround)

Sometimes the object data gets corrupted and returns 0 whenever generate tries to use it (refresh to fix)

Certain settings on the video function may cause it to not work (refresh if this happens)

## Difference of Gaussians
The [difference of gaussians](https://en.wikipedia.org/wiki/Difference_of_Gaussians") algorithm is an algorithm used in image processing. There
are many uses for it but my implementation is a rough implementation. Many art styles
can be mimicked by simply altering the various variables, most notably charcoal, water paint, pencil, and comic book. The process of adding color and texture to
the final image can be forever improved. My algorithm is mostly focused on the basic implementation itself. The main principal is calculating two different gaussian
blurs using different standard deviations (std_e and (std_e * k)) and subtracting them using the (1 + t)*(First Gaussian) - (t)*(Second Gaussian) formula. An edge tangent
flow is calculated and then blured (std_c). The difference of gaussian is calculated by using this edge tangent flow and bluring across the edges. 


A final blur (std_m) is the calculated along the edges to reduce noise. 
The resulting value is then set to 1 if its above e. If not, it passed through a formula (o). The lower o is, the more gradients the final image will have.

## Two Examples of DoG and One of Example Art

![Taylor Swift dog image example](tswiftdog.png)
![Vanessa Zamora dog image example](vanessadog.png)

![Vanessa Zamora general art image example](vanessasim.png)





