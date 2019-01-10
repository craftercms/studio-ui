/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* Author: David Quiros
   Last Modified: March 8, 2012
*/

$('#main').bgStretcher({
	images: ['/static-assets/img/gc2.jpg'], 
	imageWidth: 1533,
	imageHeight: 1148,
    anchoringImg: 'center top'
});

$('.bgOpaque').each(function(i) {
    $(this).
    	children().wrapAll('<div class="opaque-container" />').end().
		append('<div class="opaque-background" />'); 
});
















